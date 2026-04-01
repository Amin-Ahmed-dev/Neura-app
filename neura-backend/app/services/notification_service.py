"""
Expo Push Notification service.
Sends push notifications via the Expo Push API.
"""
import json
import logging
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def send_push(
    push_token: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> bool:
    """Send a single push notification via Expo Push API."""
    if not push_token or not push_token.startswith("ExponentPushToken"):
        return False

    payload = {
        "to": push_token,
        "title": title,
        "body": body,
        "sound": "default",
        "data": data or {},
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                EXPO_PUSH_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            result = resp.json()
            ticket = result.get("data", {})
            if ticket.get("status") == "error":
                logger.warning("Push error: %s", ticket.get("message"))
                return False
            return True
    except Exception as exc:
        logger.error("Failed to send push notification: %s", exc)
        return False


async def send_push_batch(messages: list[dict]) -> None:
    """Send multiple push notifications in one batch request."""
    if not messages:
        return
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            await client.post(
                EXPO_PUSH_URL,
                json=messages,
                headers={"Content-Type": "application/json"},
            )
    except Exception as exc:
        logger.error("Batch push failed: %s", exc)


def _get_pref(user, key: str, default: bool = True) -> bool:
    """Helper to read a notification preference from the user's JSON prefs."""
    try:
        prefs = json.loads(user.notification_prefs or "{}")
        return bool(prefs.get(key, default))
    except (json.JSONDecodeError, TypeError):
        return default


def _in_quiet_hours(user) -> bool:
    """Returns True if current Cairo time is within the user's quiet hours."""
    # Quiet hours are not yet stored per-user; default 23:00–07:00 Cairo
    from datetime import datetime
    import zoneinfo
    cairo = zoneinfo.ZoneInfo("Africa/Cairo")
    now = datetime.now(cairo)
    hour = now.hour
    return hour >= 23 or hour < 7
