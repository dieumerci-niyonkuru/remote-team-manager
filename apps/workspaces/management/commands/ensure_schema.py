"""
ensure_schema — Django management command
=========================================
Runs BEFORE `migrate --fake-initial` on Railway to fix any partial / inconsistent
table state that would cause migration to fail.

Critical fix for:
  django.db.utils.ProgrammingError: relation "chat_message" does not exist

Root cause: When the old Railway DB was created with a split chat migration
(0001=ChatRoom only, 0002=Message+Reactions), and those were later consolidated
into a single 0001_initial, the DB ends up with:
  - django_migrations: ('chat', '0001_initial') applied  ← stale record
  - chat_chatroom table EXISTS (created by old 0001)
  - chat_message table MISSING (was in old 0002 that was deleted)

`migrate --fake-initial` then:
  - Sees 0001_initial already applied → skips
  - chat_message never created
  - App crashes on first query: "relation chat_message does not exist"

This command detects and fixes all such partial states BEFORE migrate runs.
Uses raw psycopg2 in autocommit=True mode so DDL commits immediately.
"""

import os
from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone


# All tables that chat's 0001_initial should create
CHAT_TABLES = [
    'chat_messagereaction',
    'chat_readreceipt',
    'chat_chatroom_participants',  # M2M through table
    'chat_message',
    'chat_chatroom',
]

# Other apps that might have partial-state issues
GUARDED_APPS = [
    # (app_label, migration_name, required_tables)
    ('accounts',      '0001_initial', ['accounts_user']),
    ('workspaces',    '0001_initial', ['workspaces_workspace', 'workspaces_workspacemember']),
    ('projects',      '0001_initial', ['projects_project', 'projects_task']),
    ('notifications', '0001_initial', ['notifications_notification', 'notifications_invite']),
    ('presence',      '0001_initial', ['presence_presence']),
]


class Command(BaseCommand):
    help = 'Ensure the database schema is consistent before running migrations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        self.stdout.write(self.style.MIGRATE_HEADING(
            '=== ensure_schema: Pre-migration DB state check ==='
        ))
        if dry_run:
            self.stdout.write(self.style.WARNING('  DRY RUN — no changes will be made'))

        # Get the underlying psycopg2 connection so we can set autocommit=True
        # This is CRITICAL: DDL statements (DROP TABLE) must commit immediately.
        # If they're inside a Django-managed transaction they'll be rolled back
        # when the cursor context exits.
        connection.ensure_connection()
        raw_conn = connection.connection

        if raw_conn is None:
            self.stdout.write(self.style.ERROR('  No database connection available'))
            return

        # Save original autocommit state and enable it for DDL
        original_autocommit = raw_conn.autocommit
        if not dry_run:
            raw_conn.autocommit = True

        try:
            with raw_conn.cursor() as cur:
                # ── Guard: does django_migrations exist? ──────────────────
                if not self._table_exists(cur, 'django_migrations'):
                    self.stdout.write(
                        '  django_migrations does not exist → fresh database, skipping'
                    )
                    return

                # ── Fix chat tables ───────────────────────────────────────
                self._fix_chat(cur, dry_run)

                # ── Fix other apps ────────────────────────────────────────
                for app, migration, required_tables in GUARDED_APPS:
                    self._fix_app(cur, app, migration, required_tables, dry_run)

        finally:
            if not dry_run:
                raw_conn.autocommit = original_autocommit

        self.stdout.write(self.style.SUCCESS('  ensure_schema complete'))

    # ── Chat-specific fix (most complex) ─────────────────────────────────────

    def _fix_chat(self, cur, dry_run):
        applied = self._get_applied(cur, 'chat')
        chatroom_ok = self._table_exists(cur, 'chat_chatroom')
        chatmsg_ok  = self._table_exists(cur, 'chat_message')
        both_ok     = chatroom_ok and chatmsg_ok

        self.stdout.write(
            f'  [chat] chatroom={chatroom_ok} message={chatmsg_ok} '
            f'applied={applied or "none"}'
        )

        # Case 1: Both tables exist, 0001_initial not recorded → just fake it
        if both_ok and '0001_initial' not in applied:
            self.stdout.write('  [chat] Action: fake 0001_initial (tables exist, record missing)')
            if not dry_run:
                self._drop_chat_records(cur)
                self._fake_migration(cur, 'chat', '0001_initial')
            return

        # Case 2: 0001_initial recorded but tables incomplete → ghost migration
        if '0001_initial' in applied and not both_ok:
            self.stdout.write(
                '  [chat] Action: ghost migration detected (0001_initial recorded '
                'but tables incomplete) → dropping all chat tables for clean recreation'
            )
            if not dry_run:
                self._drop_chat_tables(cur)
                self._drop_chat_records(cur)
            return

        # Case 3: chatroom exists, message missing (common split-migration remnant)
        if chatroom_ok and not chatmsg_ok:
            self.stdout.write(
                '  [chat] Action: partial tables (chatroom only) → dropping for recreation'
            )
            if not dry_run:
                self._drop_chat_tables(cur)
                self._drop_chat_records(cur)
            return

        # Case 4: message exists, chatroom missing (inverted partial state)
        if chatmsg_ok and not chatroom_ok:
            self.stdout.write(
                '  [chat] Action: partial tables (message only) → dropping for recreation'
            )
            if not dry_run:
                self._drop_chat_tables(cur)
                self._drop_chat_records(cur)
            return

        # Case 5: Old split schema — any '0002' record detected
        if any('0002' in m for m in applied):
            self.stdout.write('  [chat] Action: old 0002 migration record detected')
            if both_ok:
                self.stdout.write('    Both tables exist → clearing old records + faking 0001_initial')
                if not dry_run:
                    self._drop_chat_records(cur)
                    self._fake_migration(cur, 'chat', '0001_initial')
            else:
                self.stdout.write('    Tables missing from old schema → dropping for recreation')
                if not dry_run:
                    self._drop_chat_tables(cur)
                    self._drop_chat_records(cur)
            return

        self.stdout.write('  [chat] State OK — no action needed')

    # ── Generic app fix ───────────────────────────────────────────────────────

    def _fix_app(self, cur, app, migration, required_tables, dry_run):
        applied = self._get_applied(cur, app)
        missing = [t for t in required_tables if not self._table_exists(cur, t)]

        if not missing:
            return  # All tables exist — nothing to do

        if migration in applied:
            # Migration recorded but tables missing — ghost migration
            self.stdout.write(
                f'  [{app}] WARNING: {migration} recorded but tables missing: {missing}'
            )
            self.stdout.write(f'  [{app}] Action: clearing stale migration record')
            if not dry_run:
                cur.execute(
                    "DELETE FROM django_migrations WHERE app=%s AND name=%s",
                    [app, migration]
                )
        # else: migration not recorded + tables missing = clean state, will migrate normally

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _table_exists(cur, table_name):
        cur.execute(
            """
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = %s
            )
            """,
            [table_name],
        )
        row = cur.fetchone()
        return bool(row and row[0])

    @staticmethod
    def _get_applied(cur, app):
        try:
            cur.execute("SELECT name FROM django_migrations WHERE app=%s", [app])
            return [r[0] for r in cur.fetchall()]
        except Exception:
            return []

    @staticmethod
    def _fake_migration(cur, app, name):
        cur.execute(
            "INSERT INTO django_migrations (app, name, applied) "
            "VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
            [app, name, timezone.now()],
        )

    @classmethod
    def _drop_chat_tables(cls, cur):
        for tbl in CHAT_TABLES:
            cur.execute(f'DROP TABLE IF EXISTS "{tbl}" CASCADE')

    @staticmethod
    def _drop_chat_records(cur):
        cur.execute("DELETE FROM django_migrations WHERE app='chat'")
