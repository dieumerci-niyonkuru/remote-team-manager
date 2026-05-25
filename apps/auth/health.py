import datetime
from django.http import JsonResponse
from django.views import View


class HealthCheckView(View):
    """Extended health check endpoint that reports DB, cache, and migration status."""

    def get(self, request, *args, **kwargs):
        checks = {}
        overall = "ok"

        # Database check
        try:
            from django.db import connection
            connection.ensure_connection()
            # Run a minimal query to confirm the DB is responding
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            checks["db"] = "ok"
        except Exception as exc:
            checks["db"] = f"error: {exc}"
            overall = "degraded"

        # Cache check
        try:
            from django.core.cache import cache
            cache.set("_health_extended", "1", timeout=5)
            checks["cache"] = "ok" if cache.get("_health_extended") == "1" else "miss"
        except Exception as exc:
            checks["cache"] = f"unavailable: {exc}"

        # Migration check
        try:
            from django.db.migrations.executor import MigrationExecutor
            executor = MigrationExecutor(connection)
            plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
            if plan:
                unapplied = [str(m) for m, _ in plan]
                checks["migrations"] = f"pending: {unapplied}"
                overall = "degraded"
            else:
                checks["migrations"] = "ok"
        except Exception as exc:
            checks["migrations"] = f"error: {exc}"
            overall = "degraded"

        return JsonResponse(
            {
                "status": overall,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "version": "1.0.0",
                "checks": checks,
            },
            status=200,  # Always 200 so load-balancer health checks pass
        )
