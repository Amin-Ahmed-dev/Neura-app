import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    student_type: Optional[str] = None
    school_name: Optional[str] = None
    reminder_time: Optional[str] = None
    bedtime: Optional[str] = None
    wake_time: Optional[str] = None


class PrivacyUpdate(BaseModel):
    show_on_leaderboard: Optional[bool] = None
    allow_data_for_ai: Optional[bool] = None


class PushTokenUpdate(BaseModel):
    push_token: str
    platform: Optional[str] = None


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """Return full user profile."""
    try:
        notif_prefs = json.loads(user.notification_prefs or "{}")
    except (json.JSONDecodeError, TypeError):
        notif_prefs = {}

    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "student_type": user.student_type,
        "school_name": user.school_name,
        "is_pro": user.is_pro,
        "neurons_balance": user.neurons_balance,
        "streak_count": user.streak_count,
        "streak_freeze_count": user.streak_freeze_count,
        "reminder_time": user.reminder_time,
        "bedtime": user.bedtime,
        "wake_time": user.wake_time,
        "notification_preferences": notif_prefs,
        "privacy_settings": {
            "show_on_leaderboard": user.show_on_leaderboard,
            "allow_data_for_ai": user.allow_data_for_ai,
        },
    }


@router.patch("/profile")
async def update_profile(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update editable profile fields."""
    if body.name is not None:
        user.name = body.name
    if body.student_type is not None:
        user.student_type = body.student_type
    if body.school_name is not None:
        user.school_name = body.school_name
    if body.reminder_time is not None:
        user.reminder_time = body.reminder_time
    if body.bedtime is not None:
        user.bedtime = body.bedtime
    if body.wake_time is not None:
        user.wake_time = body.wake_time
    await db.flush()
    return {"status": "updated"}


@router.patch("/privacy-settings")
async def update_privacy_settings(
    body: PrivacyUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update privacy toggles."""
    if body.show_on_leaderboard is not None:
        user.show_on_leaderboard = body.show_on_leaderboard
    if body.allow_data_for_ai is not None:
        user.allow_data_for_ai = body.allow_data_for_ai
    await db.flush()
    return {"status": "updated"}


@router.post("/push-token")
async def update_push_token(
    body: PushTokenUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Store/update FCM push token."""
    user.push_token = body.push_token
    await db.flush()
    return {"status": "ok"}
