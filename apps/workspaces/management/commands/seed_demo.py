"""
Seed the database with a complete, realistic demo workspace.

Creates 7 demo users, the "Nexus Labs" workspace, 4 projects, 28 tasks with
subtasks / comments / time logs, 3 chat channels with messages and reactions,
an activity feed, OKRs, wiki articles, notifications, and HR records.

Everything is idempotent (get_or_create), so it is safe to run repeatedly.

    python manage.py seed_demo
    python manage.py seed_demo --password mysecret

Demo login (all accounts share the same password, default "demo1234"):

    Owner    : demo@nexuslabs.io   / demo1234   (username: demo)
    Manager  : amina@nexuslabs.io  / demo1234
    Developer: kevin@nexuslabs.io  / demo1234
    Developer: sarah@nexuslabs.io  / demo1234
    Developer: david@nexuslabs.io  / demo1234
    Developer: grace@nexuslabs.io  / demo1234
    Viewer   : tom@nexuslabs.io    / demo1234
"""
import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from apps.workspaces.models import Workspace, WorkspaceMember, ActivityFeed
from apps.projects.models import Project, Task, Subtask, Comment
from apps.chat.models import ChatRoom, Message, MessageReaction

User = get_user_model()

# (username, first, last, email, account_role, workspace_role, bio)
PEOPLE = [
    ("demo",  "Dieumerci", "Niyonkuru", "demo@nexuslabs.io",  "workspace_owner", "owner",
     "Founder & product lead. Building tools for distributed teams."),
    ("amina", "Amina",     "Uwase",     "amina@nexuslabs.io", "product",         "manager",
     "Product manager. Roadmap, discovery, and keeping everyone unblocked."),
    ("kevin", "Kevin",     "Mugisha",   "kevin@nexuslabs.io", "backend",         "developer",
     "Backend engineer. Django, Postgres, and everything async."),
    ("sarah", "Sarah",     "Chen",      "sarah@nexuslabs.io", "frontend",        "developer",
     "Frontend engineer. React, design systems, accessibility."),
    ("david", "David",     "Okonkwo",   "david@nexuslabs.io", "devops",          "developer",
     "Platform & DevOps. CI/CD, observability, and uptime."),
    ("grace", "Grace",     "Ingabire",  "grace@nexuslabs.io", "designer",        "developer",
     "Product designer. Interface, motion, and design systems."),
    ("tom",   "Tom",       "Baker",     "tom@nexuslabs.io",   "qa",              "viewer",
     "QA engineer. Test automation and release verification."),
]

# (name, description, status, project_type, days_ago_created)
PROJECTS = [
    ("Mobile App v2.0", "Native iOS and Android rewrite with offline-first sync and push notifications.",
     "active", "Software Development", 74),
    ("Website Redesign", "New marketing site with refreshed brand, CMS integration, and a component library.",
     "active", "Design", 51),
    ("API Platform", "Public REST and WebSocket API with tiered rate limiting for third-party integrations.",
     "active", "Software Development", 38),
    ("Data Migration", "Move the legacy Postgres cluster to managed infrastructure with zero downtime.",
     "completed", "Infrastructure", 95),
]

# (project, title, status, priority, assignee, days_ago_created, due_in_days, est_min, description)
TASKS = [
    # --- Mobile App v2.0
    ("Mobile App v2.0", "Offline sync conflict resolution", "in_progress", "urgent", "kevin", 12, 3, 960,
     "Last-write-wins is losing edits when two devices go offline. Needs a vector-clock merge strategy."),
    ("Mobile App v2.0", "Push notification service integration", "in_progress", "high", "david", 18, 5, 480,
     "Wire up FCM and APNs behind a single internal service with per-user opt-out."),
    ("Mobile App v2.0", "Biometric login (Face ID / fingerprint)", "review", "high", "sarah", 21, 1, 360,
     "Secure enclave token storage, with passcode fallback on unsupported devices."),
    ("Mobile App v2.0", "Onboarding flow redesign", "done", "medium", "grace", 40, -12, 600,
     "Cut onboarding from 7 screens to 3. Ship the illustrated empty states."),
    ("Mobile App v2.0", "Crash reporting + Sentry breadcrumbs", "done", "medium", "david", 35, -8, 240,
     "Symbolicated stack traces on both platforms with release tagging."),
    ("Mobile App v2.0", "Dark mode across all screens", "todo", "medium", "sarah", 8, 14, 720,
     "Audit every screen against the new token palette, including charts and maps."),
    ("Mobile App v2.0", "Reduce cold start below 2s", "todo", "high", "kevin", 6, 10, 480,
     "Currently 3.4s on mid-tier Android. Defer non-critical module init."),
    ("Mobile App v2.0", "Accessibility audit (WCAG AA)", "todo", "low", "tom", 5, 21, 600,
     "Screen reader labels, focus order, and contrast ratios on every interactive element."),
    ("Mobile App v2.0", "In-app update prompt", "review", "low", "sarah", 14, 2, 180,
     "Soft prompt for minor versions, forced gate for breaking API changes."),

    # --- Website Redesign
    ("Website Redesign", "Design system component library", "in_progress", "high", "grace", 24, 4, 1440,
     "Buttons, forms, cards, and navigation as documented Figma components with tokens."),
    ("Website Redesign", "Homepage hero and above-the-fold", "done", "high", "grace", 38, -10, 480,
     "New headline, product screenshot, and a single primary call to action."),
    ("Website Redesign", "CMS integration for blog", "in_progress", "medium", "sarah", 16, 7, 720,
     "Headless CMS with preview builds on every draft save."),
    ("Website Redesign", "Pricing page A/B test", "todo", "medium", "amina", 4, 12, 300,
     "Three-tier layout versus the current comparison table. Two-week run."),
    ("Website Redesign", "Lighthouse score above 95", "todo", "high", "david", 7, 9, 420,
     "Image formats, font loading strategy, and render-blocking scripts."),
    ("Website Redesign", "SEO metadata and sitemap", "done", "low", "amina", 30, -5, 180,
     "Open Graph tags, canonical URLs, and an auto-generated sitemap."),
    ("Website Redesign", "Cookie consent banner", "review", "medium", "sarah", 11, 1, 240,
     "Granular opt-in that defaults to essential-only, per GDPR."),

    # --- API Platform
    ("API Platform", "OpenAPI 3.1 schema generation", "in_progress", "high", "kevin", 15, 6, 600,
     "Auto-generate from DRF serializers and publish to the developer portal."),
    ("API Platform", "Tiered rate limiting middleware", "in_progress", "urgent", "kevin", 9, 2, 480,
     "Free / Pro / Enterprise buckets with Redis token counters and clear 429 headers."),
    ("API Platform", "Webhook delivery with retries", "todo", "high", "david", 6, 11, 720,
     "Exponential backoff, dead-letter queue, and a per-endpoint delivery log."),
    ("API Platform", "API key management UI", "todo", "medium", "sarah", 5, 15, 540,
     "Create, scope, rotate, and revoke keys with last-used timestamps."),
    ("API Platform", "Developer portal documentation", "todo", "medium", "amina", 3, 18, 900,
     "Quickstart, authentication guide, and runnable code samples in 4 languages."),
    ("API Platform", "Load test to 10k req/s", "todo", "low", "tom", 2, 25, 480,
     "k6 scenarios covering read-heavy and write-heavy traffic shapes."),
    ("API Platform", "Versioning strategy (v1 freeze)", "review", "high", "kevin", 13, 1, 300,
     "Header-based versioning with a documented 12-month deprecation window."),

    # --- Data Migration (completed project)
    ("Data Migration", "Schema audit and mapping", "done", "high", "kevin", 88, -70, 720,
     "Catalogue every table, index, and constraint before the cutover."),
    ("Data Migration", "Dual-write shadow period", "done", "urgent", "david", 80, -55, 1200,
     "Two weeks of parallel writes with automated row-count reconciliation."),
    ("Data Migration", "Cutover runbook and rollback plan", "done", "urgent", "david", 72, -48, 480,
     "Step-by-step runbook with a tested 15-minute rollback path."),
    ("Data Migration", "Post-migration performance tuning", "done", "medium", "kevin", 64, -40, 600,
     "Rebuild indexes, refresh planner statistics, and right-size the connection pool."),
    ("Data Migration", "Decommission legacy cluster", "done", "low", "david", 58, -33, 240,
     "Final verified backup to cold storage, then tear down the old instances."),
]

SUBTASKS = {
    "Offline sync conflict resolution": [
        ("Reproduce the conflict with two offline clients", True),
        ("Write up three merge strategies with trade-offs", True),
        ("Implement vector clock comparison", True),
        ("Add property-based tests for merge ordering", False),
        ("Ship behind a feature flag", False),
    ],
    "Design system component library": [
        ("Audit every existing component in production", True),
        ("Define the color and spacing token scale", True),
        ("Build buttons, inputs, and selects", True),
        ("Build cards, tables, and navigation", False),
        ("Publish usage documentation", False),
    ],
    "Tiered rate limiting middleware": [
        ("Benchmark Redis counter throughput", True),
        ("Implement the sliding-window algorithm", True),
        ("Return standard RateLimit-* response headers", False),
    ],
    "Push notification service integration": [
        ("Provision FCM and APNs credentials", True),
        ("Build the unified send abstraction", True),
        ("Add per-user notification preferences", False),
        ("Handle token refresh and invalidation", False),
    ],
    "Biometric login (Face ID / fingerprint)": [
        ("Store the refresh token in the secure enclave", True),
        ("Add a passcode fallback path", True),
        ("Handle enrollment changes gracefully", True),
    ],
    "OpenAPI 3.1 schema generation": [
        ("Annotate every serializer", True),
        ("Wire the schema build into CI", True),
        ("Publish to the developer portal", False),
    ],
}

# (task, author, content, days_ago)
COMMENTS = [
    ("Offline sync conflict resolution", "amina",
     "This is the top complaint in support tickets this month. Can we get an estimate by Thursday?", 4),
    ("Offline sync conflict resolution", "kevin",
     "Vector clocks are working in the prototype. Merge is deterministic across 3 devices now.", 2),
    ("Offline sync conflict resolution", "tom",
     "I can write the multi-device test harness once the flag is in. Give me a shout.", 1),
    ("Design system component library", "grace",
     "Tokens are locked. Please pull the latest Figma library before starting anything new.", 3),
    ("Design system component library", "sarah",
     "Buttons and inputs are ported to code. Cards are next, should land this week.", 1),
    ("Tiered rate limiting middleware", "kevin",
     "Redis counters hold up fine at 12k ops/s locally. Headers are the last piece.", 2),
    ("Tiered rate limiting middleware", "david",
     "Remember to exempt the health check endpoint, it got throttled in staging.", 1),
    ("Reduce cold start below 2s", "kevin",
     "Profiler says 1.1s is analytics init. Moving it off the critical path should get us most of the way.", 2),
    ("Lighthouse score above 95", "david",
     "Serving AVIF with WebP fallback took us from 71 to 89. Fonts are the remaining blocker.", 3),
    ("Pricing page A/B test", "amina",
     "Need two weeks of traffic for significance. Proposing we start Monday.", 1),
]

# (name, room_type, member usernames)
ROOMS = [
    ("general", "workspace", [p[0] for p in PEOPLE]),
    ("engineering", "group", ["demo", "kevin", "sarah", "david", "tom"]),
    ("design", "group", ["demo", "grace", "sarah", "amina"]),
]

# (room, sender, content, days_ago, hour)
MESSAGES = [
    ("general", "amina", "Morning everyone. Standup notes are in the wiki, and the sprint board is updated.", 2, 9),
    ("general", "david", "Heads up: deploying the rate limiter to staging at 14:00 UTC. Expect a brief blip.", 2, 8),
    ("general", "grace", "New component library is published in Figma. Please pull before starting new screens.", 2, 6),
    ("general", "demo", "Great week team. Mobile v2 is at 74% and the migration is fully wrapped.", 1, 17),
    ("general", "sarah", "Cookie banner is in review, should be mergeable this afternoon.", 1, 5),
    ("general", "tom", "Regression suite is green on both platforms as of this morning's build.", 0, 3),

    ("engineering", "kevin", "The offline sync bug is a merge ordering problem, not a network problem.", 3, 11),
    ("engineering", "david", "That matches the logs. Two devices, both offline, second sync silently wins.", 3, 10),
    ("engineering", "kevin", "Vector clocks fix it. Prototype is deterministic across three devices now.", 2, 14),
    ("engineering", "sarah", "Nice. Does that change the client payload shape at all?", 2, 13),
    ("engineering", "kevin", "One extra field on the envelope. Backwards compatible, old clients ignore it.", 2, 12),
    ("engineering", "tom", "I'll build the multi-device harness once it's behind the flag.", 1, 9),
    ("engineering", "david", "Cold start profiling is up on the dashboard. Analytics init is 1.1s of the 3.4s.", 0, 4),

    ("design", "grace", "Onboarding went from 7 screens to 3. Drop-off in the prototype test fell by half.", 4, 15),
    ("design", "amina", "That's a big win. Can we get the same treatment on the pricing page?", 4, 14),
    ("design", "grace", "Already sketching it. Three tiers instead of the comparison table.", 3, 16),
    ("design", "sarah", "Tokens ported cleanly to code. Dark mode mostly falls out for free now.", 1, 7),
    ("design", "grace", "Perfect. I'll audit the chart colors against AA contrast this week.", 0, 6),
]

# (message content, reacting user, emoji)
REACTIONS = [
    ("Vector clocks fix it. Prototype is deterministic across three devices now.", "sarah", "\U0001F389"),
    ("Vector clocks fix it. Prototype is deterministic across three devices now.", "david", "\U0001F44D"),
    ("Great week team. Mobile v2 is at 74% and the migration is fully wrapped.", "grace", "\U0001F525"),
    ("Onboarding went from 7 screens to 3. Drop-off in the prototype test fell by half.", "amina", "\U0001F44F"),
]

# (actor, action, object_type, object_name, days_ago, hour)
ACTIVITY = [
    ("kevin", "updated", "task", "Offline sync conflict resolution", 0, 3),
    ("sarah", "moved to review", "task", "Cookie consent banner", 0, 5),
    ("tom", "commented on", "task", "Offline sync conflict resolution", 1, 2),
    ("grace", "completed", "task", "Homepage hero and above-the-fold", 1, 8),
    ("david", "created", "task", "Webhook delivery with retries", 2, 4),
    ("amina", "created", "project", "Website Redesign", 3, 10),
    ("kevin", "completed", "task", "Post-migration performance tuning", 4, 6),
    ("david", "completed", "task", "Decommission legacy cluster", 5, 9),
    ("sarah", "moved to review", "task", "In-app update prompt", 6, 11),
    ("grace", "completed", "task", "Onboarding flow redesign", 7, 14),
    ("amina", "invited", "member", "Tom Baker", 9, 7),
    ("demo", "created", "workspace", "Nexus Labs", 112, 12),
]

OKRS = [
    ("Ship Mobile App v2.0 to general availability",
     "Get the rewrite into both stores with parity on every core flow.",
     [("Feature parity with v1", 100, 88, "%"),
      ("Crash-free session rate", 99.5, 99.1, "%"),
      ("Beta testers onboarded", 500, 412, "users")]),
    ("Grow the third-party developer ecosystem",
     "Make the public API something teams can build a business on.",
     [("Published API endpoints", 40, 26, "endpoints"),
      ("Active integration partners", 15, 6, "partners"),
      ("Median API response time", 120, 148, "ms")]),
    ("Raise engineering delivery confidence",
     "Ship smaller, safer, and more often.",
     [("Automated test coverage", 85, 72, "%"),
      ("Deploy frequency", 20, 14, "per month"),
      ("Mean time to recovery", 30, 41, "min")]),
]

ARTICLES = [
    ("Engineering Onboarding", "Engineering",
     "Welcome to Nexus Labs.\n\nDay one: get your laptop provisioned, request repo access in #engineering, "
     "and pair with your onboarding buddy.\n\nDay two to five: ship one small change end to end. "
     "Everyone's first pull request goes to production in their first week.\n\n"
     "Ask questions early and often. There is no such thing as a dumb question here."),
    ("How We Run Sprints", "Process",
     "Two-week sprints starting Monday.\n\nPlanning is 45 minutes, capped. Anything longer means the work "
     "was not broken down enough.\n\nStandup is async in #general before 10:00 in your local time. "
     "Write what you shipped, what is next, and what is blocking you.\n\n"
     "Retro is Friday afternoon. Blameless, and every action item gets an owner."),
    ("Incident Response Runbook", "Operations",
     "Severity 1 means customer data is at risk or the product is fully down.\n\n"
     "First responder declares the incident in #general, takes the commander role, and does not debug. "
     "The commander coordinates only.\n\nPost-incident review happens within 48 hours. "
     "We fix systems, not people."),
    ("API Design Guidelines", "Engineering",
     "Resources are plural nouns. Verbs live in the HTTP method, not the path.\n\n"
     "Every list endpoint is paginated from day one. No exceptions.\n\n"
     "Breaking changes require a new version and a 12-month deprecation window with "
     "clear headers on the old one."),
    ("Remote Work Handbook", "Culture",
     "We are asynchronous by default. Meetings are the exception and need an agenda.\n\n"
     "Core overlap hours are 13:00 to 16:00 UTC so every time zone shares a window.\n\n"
     "Write things down. A decision that only exists in a call did not happen."),
]

# (actor, verb, description, category, priority, hours_ago, unread)
NOTIFS = [
    ("kevin", "commented on", "Offline sync conflict resolution", "task", "high", 3, True),
    ("sarah", "requested review on", "Cookie consent banner", "task", "normal", 6, True),
    ("amina", "mentioned you in", "general", "mention", "high", 9, True),
    ("grace", "completed", "Homepage hero and above-the-fold", "task", "normal", 26, False),
    ("david", "assigned you", "Webhook delivery with retries", "task", "urgent", 30, False),
    ("tom", "reported a bug on", "Biometric login (Face ID / fingerprint)", "task", "high", 48, False),
    ("amina", "invited a member to", "Nexus Labs", "invite", "normal", 72, False),
    ("kevin", "reacted to your message in", "engineering", "reaction", "low", 96, False),
]

# (task, user, days_ago, minutes, description)
TIME_LOGS = [
    ("Offline sync conflict resolution", "kevin", 1, 185, "Vector clock merge implementation"),
    ("Offline sync conflict resolution", "kevin", 2, 240, "Reproducing the multi-device conflict"),
    ("Design system component library", "grace", 1, 300, "Building form components"),
    ("Design system component library", "sarah", 2, 150, "Porting button variants to code"),
    ("Tiered rate limiting middleware", "kevin", 0, 95, "Redis counter benchmarks"),
    ("CMS integration for blog", "sarah", 3, 210, "Preview build wiring"),
    ("Push notification service integration", "david", 1, 165, "APNs certificate setup"),
    ("Lighthouse score above 95", "david", 2, 130, "Image format conversion"),
]

# (username, employee_id, department, position, salary, days_since_hire)
HR_PROFILES = [
    ("demo",  "NX-001", "Leadership",  "Founder & Product Lead",  9500, 112),
    ("amina", "NX-002", "Product",     "Product Manager",         7200, 98),
    ("kevin", "NX-003", "Engineering", "Senior Backend Engineer", 8100, 95),
    ("sarah", "NX-004", "Engineering", "Frontend Engineer",       7400, 76),
    ("david", "NX-005", "Platform",    "DevOps Engineer",         7800, 64),
    ("grace", "NX-006", "Design",      "Product Designer",        6900, 51),
    ("tom",   "NX-007", "Quality",     "QA Engineer",             6100, 22),
]

JOB_POSTINGS = [
    ("Senior Mobile Engineer", "Remote (UTC-3 to UTC+3)", 7500, 9500,
     "Own the mobile client end to end as we scale v2 to general availability.",
     "5+ years native mobile. Offline-first sync experience strongly preferred."),
    ("Technical Writer", "Remote (Global)", 4800, 6200,
     "Build the developer portal and make our public API genuinely pleasant to adopt.",
     "Experience documenting REST APIs. Writing samples required."),
]


class Command(BaseCommand):
    help = "Seed the database with the Nexus Labs demo workspace, users, and content."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password", default="demo1234",
            help='Password applied to every demo account (default: "demo1234").',
        )

    @staticmethod
    def _backdate(model, pk, field, dt):
        """Bypass auto_now_add / auto_now so seeded history looks real."""
        model.objects.filter(pk=pk).update(**{field: dt})

    @transaction.atomic
    def handle(self, *args, **options):
        password = options["password"]
        now = timezone.now()
        random.seed(7)
        write = self.stdout.write

        # ---- users ----------------------------------------------------------
        users = {}
        for uname, first, last, email, role, _wsrole, bio in PEOPLE:
            u, _ = User.objects.get_or_create(
                username=uname,
                defaults=dict(email=email, first_name=first, last_name=last, role=role, bio=bio),
            )
            u.email, u.first_name, u.last_name, u.role, u.bio = email, first, last, role, bio
            u.set_password(password)
            if uname == "demo":
                u.is_staff = u.is_superuser = True
            u.save()
            users[uname] = u
        owner = users["demo"]
        write(f"users: {len(users)}")

        # ---- workspace ------------------------------------------------------
        ws, _ = Workspace.objects.get_or_create(
            name="Nexus Labs",
            defaults=dict(
                description="Distributed product team building developer tools across 4 time zones.",
                created_by=owner,
            ),
        )
        ws.description = "Distributed product team building developer tools across 4 time zones."
        ws.save()
        for uname, *_rest in PEOPLE:
            ws.members.add(users[uname])
        for uname, _f, _l, _e, _r, wsrole, _b in PEOPLE:
            WorkspaceMember.objects.update_or_create(
                workspace=ws, user=users[uname], defaults=dict(role=wsrole)
            )
        self._backdate(Workspace, ws.pk, "created_at", now - timedelta(days=112))
        write(f"workspace: {ws.name} / members {ws.members.count()}")

        # ---- projects -------------------------------------------------------
        projects = {}
        for name, desc, status, ptype, age in PROJECTS:
            p, _ = Project.objects.get_or_create(
                name=name, workspace=ws,
                defaults=dict(description=desc, status=status, project_type=ptype, created_by=owner),
            )
            p.description, p.status, p.project_type = desc, status, ptype
            p.save()
            self._backdate(Project, p.pk, "created_at", now - timedelta(days=age))
            projects[name] = p
        write(f"projects: {len(projects)}")

        # ---- tasks ----------------------------------------------------------
        created_tasks = {}
        for pname, title, status, prio, assignee, ago, due_in, est, desc in TASKS:
            t, _ = Task.objects.get_or_create(
                title=title, project=projects[pname],
                defaults=dict(
                    description=desc, status=status, priority=prio,
                    assignee=users[assignee], created_by=owner,
                    due_date=now + timedelta(days=due_in), estimated_minutes=est,
                ),
            )
            t.description, t.status, t.priority = desc, status, prio
            t.assignee = users[assignee]
            t.due_date = now + timedelta(days=due_in)
            t.estimated_minutes = est
            t.save()
            self._backdate(Task, t.pk, "created_at", now - timedelta(days=ago))
            created_tasks[title] = t
        write(f"tasks: {len(created_tasks)}")

        # ---- subtasks -------------------------------------------------------
        sub_n = 0
        for title, items in SUBTASKS.items():
            t = created_tasks.get(title)
            if not t:
                continue
            for stitle, done in items:
                Subtask.objects.get_or_create(task=t, title=stitle, defaults=dict(is_completed=done))
                sub_n += 1
        write(f"subtasks: {sub_n}")

        # ---- comments -------------------------------------------------------
        com_n = 0
        for title, uname, content, ago in COMMENTS:
            t = created_tasks.get(title)
            if not t:
                continue
            c, made = Comment.objects.get_or_create(task=t, user=users[uname], content=content)
            if made:
                self._backdate(Comment, c.pk, "created_at",
                               now - timedelta(days=ago, hours=random.randint(1, 20)))
            com_n += 1
        write(f"comments: {com_n}")

        # ---- chat -----------------------------------------------------------
        rooms = {}
        for name, rtype, members in ROOMS:
            r, _ = ChatRoom.objects.get_or_create(name=name, workspace=ws, defaults=dict(room_type=rtype))
            r.room_type = rtype
            r.save()
            for m in members:
                r.participants.add(users[m])
            rooms[name] = r

        msg_n = 0
        for rname, uname, content, days_ago, hour in MESSAGES:
            m, made = Message.objects.get_or_create(room=rooms[rname], sender=users[uname], content=content)
            if made:
                ts = (now - timedelta(days=days_ago)).replace(hour=hour, minute=random.randint(0, 59))
                self._backdate(Message, m.pk, "created_at", ts)
            msg_n += 1

        for content, uname, emoji in REACTIONS:
            m = Message.objects.filter(content=content).first()
            if m:
                MessageReaction.objects.get_or_create(message=m, user=users[uname], emoji=emoji)
        write(f"chat: {len(rooms)} rooms / {msg_n} messages")

        # ---- activity feed --------------------------------------------------
        act_n = 0
        for uname, action, otype, oname, days_ago, hour in ACTIVITY:
            a, made = ActivityFeed.objects.get_or_create(
                workspace=ws, actor=users[uname], action=action,
                object_type=otype, object_name=oname, defaults=dict(object_id=1),
            )
            if made:
                self._backdate(ActivityFeed, a.pk, "timestamp",
                               (now - timedelta(days=days_ago)).replace(hour=hour))
            act_n += 1
        write(f"activity: {act_n}")

        # ---- OKRs (optional app) -------------------------------------------
        try:
            from apps.okr.models import Objective, KeyResult
            for title, desc, krs in OKRS:
                o, _ = Objective.objects.get_or_create(
                    workspace=ws, title=title, defaults=dict(description=desc, created_by=owner)
                )
                for ktitle, target, current, unit in krs:
                    KeyResult.objects.get_or_create(
                        objective=o, title=ktitle,
                        defaults=dict(target_value=target, current_value=current, unit=unit),
                    )
            write(f"okr: {Objective.objects.filter(workspace=ws).count()} objectives")
        except Exception as e:
            write(f"okr skipped: {e}")

        # ---- wiki (optional app) -------------------------------------------
        try:
            from apps.wiki.models import WikiArticle
            for title, cat, content in ARTICLES:
                WikiArticle.objects.get_or_create(
                    workspace=ws, title=title,
                    defaults=dict(content=content, category=cat, author=owner),
                )
            write(f"wiki: {WikiArticle.objects.filter(workspace=ws).count()} articles")
        except Exception as e:
            write(f"wiki skipped: {e}")

        # ---- notifications (optional app) ----------------------------------
        try:
            from apps.notifications.models import Notification
            for actor, verb, desc, cat, prio, hours_ago, unread in NOTIFS:
                n, made = Notification.objects.get_or_create(
                    recipient=owner, actor=users[actor], verb=verb,
                    defaults=dict(description=desc, category=cat, priority=prio, unread=unread),
                )
                if made:
                    self._backdate(Notification, n.pk, "timestamp", now - timedelta(hours=hours_ago))
            write(f"notifications: {Notification.objects.filter(recipient=owner).count()}")
        except Exception as e:
            write(f"notifications skipped: {e}")

        # ---- time tracking (optional app) ----------------------------------
        try:
            from apps.timetracking.models import TimeLog
            for title, uname, days_ago, mins, desc in TIME_LOGS:
                t = created_tasks.get(title)
                if not t:
                    continue
                start = (now - timedelta(days=days_ago)).replace(hour=random.randint(9, 15), minute=0)
                TimeLog.objects.get_or_create(
                    task=t, user=users[uname], description=desc,
                    defaults=dict(start_time=start, end_time=start + timedelta(minutes=mins),
                                  duration=mins * 60, is_running=False),
                )
            write(f"timelogs: {TimeLog.objects.count()}")
        except Exception as e:
            write(f"timelogs skipped: {e}")

        # ---- HR (optional app) ---------------------------------------------
        try:
            from apps.hr.models import EmployeeProfile, JobPosting
            for uname, eid, dept, pos, salary, days in HR_PROFILES:
                EmployeeProfile.objects.get_or_create(
                    user=users[uname],
                    defaults=dict(workspace=ws, employee_id=eid, department=dept, position=pos,
                                  salary=salary, hire_date=(now - timedelta(days=days)).date()),
                )
            for title, loc, lo, hi, desc, req in JOB_POSTINGS:
                JobPosting.objects.get_or_create(
                    workspace=ws, title=title,
                    defaults=dict(description=desc, requirements=req, location=loc,
                                  salary_min=lo, salary_max=hi, posted_by=owner,
                                  deadline=(now + timedelta(days=30)).date(), is_active=True),
                )
            write(f"hr: {EmployeeProfile.objects.count()} profiles / {JobPosting.objects.count()} postings")
        except Exception as e:
            write(f"hr skipped: {e}")

        self.stdout.write(self.style.SUCCESS("\nSEED COMPLETE"))
        self.stdout.write(self.style.SUCCESS(
            f"login: demo@nexuslabs.io  or  demo   /  {password}"
        ))
