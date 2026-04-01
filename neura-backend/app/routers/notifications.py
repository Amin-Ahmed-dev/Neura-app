import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


class PushTokenUpdate(BaseModel):
    push_token: str
    platform: Optional[str] = None  # "ios" | "android"


class NotificationPrefs(BaseModel):
    study_reminder: bool = True
    streak_alert: bool = True
    leaderboard: bool = True
    flashcard_due: bool = True
    material_ready: bool = True
    reminder_time: Optional[str] = None  # HH:MM


@router.post("/token")
async def register_push_token(
    body: PushTokenUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Saves the Expo push token for the user."""
    user.push_token = body.push_token
    await db.flush()
    return {"status": "ok"}


@router.delete("/token")
async def remove_push_token(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Removes the push token (e.g., on logout)."""
    user.push_token = None
    await db.flush()
    return {"status": "ok"}


@router.get("/prefs")
async def get_notification_prefs(user: User = Depends(get_current_user)):
    """Returns the user's notification preferences."""
    try:
        prefs = json.loads(user.notification_prefs)
    except (json.JSONDecodeError, TypeError):
        prefs = {}
    prefs["reminder_time"] = user.reminder_time
    return prefs


@router.patch("/prefs")
async def update_notification_prefs(
    body: NotificationPrefs,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Updates notification preferences."""
    try:
        prefs = json.loads(user.notification_prefs)
    except (json.JSONDecodeError, TypeError):
        prefs = {}

    prefs["study_reminder"] = body.study_reminder
    prefs["streak_alert"] = body.streak_alert
    prefs["leaderboard"] = body.leaderboard
    prefs["flashcard_due"] = body.flashcard_due
    prefs["material_ready"] = body.material_ready

    user.notification_prefs = json.dumps(prefs)

    if body.reminder_time:
        user.reminder_time = body.reminder_time

    await db.flush()
    return {"status": "updated", "prefs": prefs}
