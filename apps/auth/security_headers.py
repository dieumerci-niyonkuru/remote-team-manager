"""
SecurityHeadersMiddleware
=========================
Adds HTTP security headers to every response.

Headers added:
  X-Content-Type-Options   — prevent MIME sniffing
  X-Frame-Options           — clickjacking protection
  X-XSS-Protection          — legacy browser XSS filter
  Referrer-Policy           — limit referrer information leakage
  Permissions-Policy        — disable unused browser features
  Content-Security-Policy   — report-only mode on DEBUG, enforced in prod
  Strict-Transport-Security — HSTS (non-DEBUG only; Django's own setting
                               is also present but this makes it explicit)

WebRTC / WebSocket notes:
  - connect-src must allow blob:, data:, wss:, and Google STUN
  - media-src needs blob: for local stream previews
  - worker-src needs blob: for MediaRecorder workers
"""

from django.conf import settings


# Directives shared between report-only and enforce modes
_CSP_DIRECTIVES = {
    "default-src":  "'self'",
    # Scripts: allow self + eval (required for some React transforms)
    "script-src":   "'self' 'unsafe-inline' 'unsafe-eval'",
    # Styles: allow self + inline (React inline styles are JSX, not style-src)
    "style-src":    "'self' 'unsafe-inline' https://fonts.googleapis.com",
    # Fonts from Google Fonts CDN
    "font-src":     "'self' https://fonts.gstatic.com data:",
    # Images: self + data: URIs + blob: (for avatar previews)
    "img-src":      "'self' data: blob: https:",
    # WebSocket connections (ws/wss self) + Google STUN (WebRTC) + Railway
    "connect-src":  "'self' wss: ws: blob: https://fonts.googleapis.com https://fonts.gstatic.com",
    # Media: blob: for WebRTC local stream previews
    "media-src":    "'self' blob:",
    # Workers: blob: for MediaRecorder / service workers
    "worker-src":   "'self' blob:",
    # Object/embed: deny entirely
    "object-src":   "'none'",
    # Framing: deny (matches X-Frame-Options: DENY)
    "frame-ancestors": "'none'",
    # Base URI: restrict to self to prevent base-tag injection
    "base-uri":     "'self'",
    # Form action: restrict submissions to same origin
    "form-action":  "'self'",
    # Upgrade insecure requests in production
}


def _build_csp(upgrade_insecure: bool = False) -> str:
    directives = dict(_CSP_DIRECTIVES)
    if upgrade_insecure:
        directives["upgrade-insecure-requests"] = ""
    parts = []
    for key, val in directives.items():
        parts.append(f"{key} {val}".strip() if val else key)
    return "; ".join(parts)


class SecurityHeadersMiddleware:
    """Middleware that attaches security headers to every HTTP response."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # ── Core security headers ─────────────────────────────────────────────
        response["X-Content-Type-Options"] = "nosniff"
        response["X-Frame-Options"] = "DENY"
        response["X-XSS-Protection"] = "1; mode=block"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Disable geolocation by default; allow microphone + camera for video
        response["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(self), "
            "camera=(self), "
            "fullscreen=(self), "
            "picture-in-picture=(self)"
        )

        # ── Content-Security-Policy ───────────────────────────────────────────
        # In DEBUG mode we use report-only so development is not blocked.
        # In production we enforce the policy.
        csp_value = _build_csp(upgrade_insecure=not settings.DEBUG)
        if settings.DEBUG:
            # Report-only: violations are logged to the browser console, nothing is blocked
            response["Content-Security-Policy-Report-Only"] = csp_value
        else:
            response["Content-Security-Policy"] = csp_value

        # ── HSTS (belt-and-suspenders alongside Django's own setting) ─────────
        if not settings.DEBUG:
            response["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        # ── Cross-origin isolation ─────────────────────────────────────────────
        # COOP: same-origin prevents cross-window scripting attacks.
        # NOTE: We intentionally omit Cross-Origin-Embedder-Policy (COEP) here
        # because "require-corp" would block WebRTC STUN/TURN fetches and any
        # cross-origin media resources that don't opt in with CORP headers.
        response["Cross-Origin-Opener-Policy"] = "same-origin"

        return response
