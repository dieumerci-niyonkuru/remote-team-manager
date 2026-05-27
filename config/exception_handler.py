"""
Custom DRF exception handler.

DRF's default handler only catches APIException subclasses and converts them
to JSON. Anything else (IntegrityError, ValueError, any uncaught Python
exception) propagates to Django's handler500, which returns HTML with DEBUG=False.

This handler catches ALL exceptions and returns a JSON body so the frontend
always receives machine-readable error data, never an HTML 500 page.
"""
import logging
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Extends DRF's default exception handler to guarantee a JSON response for
    every error, including unhandled server-side exceptions.

    Behaviour:
      • DRF-recognized exceptions (ValidationError, AuthenticationFailed, …)
        → handled exactly as before; DRF produces the standard JSON body.
      • Everything else (IntegrityError, ValueError, AttributeError, …)
        → logged at ERROR level; a generic JSON 500 is returned instead of
          an HTML page that the browser/frontend cannot parse.
    """
    # Let DRF handle what it knows about
    response = drf_exception_handler(exc, context)
    if response is not None:
        return response

    # Anything DRF could not handle → log and return clean JSON 500
    view = context.get("view", None)
    logger.exception(
        "Unhandled exception in API view %s: %s",
        view.__class__.__name__ if view else "unknown",
        exc,
    )
    return Response(
        {"detail": "An unexpected server error occurred. Please try again."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
