from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from pydantic import BaseModel
from datetime import date, timedelta
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.study_session import StudySession
from app.models.neurons import NeuronsTransaction, ActionType
from app.models.flashcard import Flashcard
from app.models.task import Task

try:
    from app.config import settings
    import redis.asyncio as aioredis
    _redis_available = True
except Exception:
    _redis_available = False

import uuid
import json

router = APIRouter()

# Neurons per action
NEURONS_POMODORO = 25
NEURONS_STREAK_3 = 50
NEURONS_STREAK_7 = 150
NEURONS_STREAK_30 = 500


class SessionLog(BaseModel):
    duration_minutes: int
    subject: str = "عام"
    neurons_earned: int
    phase: str = "work"
    completed: bool = True


@router.post("/session")
async def log_session(
    body: SessionLog,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()

    # Create session record
    session = StudySession(
        id=uuid.uuid4(),
        user_id=user.id,
        duration_minutes=body.duration_minutes,
        subject=body.subject,
        neurons_earned=body.neurons_earned,
        phase=body.phase,
        completed=body.completed,
    )
    db.add(session)

    bonus_neurons = 0
    streak_milestone = None

    if body.completed and body.phase == "work":
        # Award Neurons
        user.neurons_balance += body.neurons_earned
        db.add(NeuronsTransaction(
            id=uuid.uuid4(),
            user_id=user.id,
            amount=body.neurons_earned,
            action_type=ActionType.POMODORO_COMPLETE,
        ))

        # Update streak
        if user.last_active_date is None or user.last_active_date < today - timedelta(days=1):
            user.streak_count = 1
        elif user.last_active_date == today - timedelta(days=1):
            user.streak_count += 1
        # If last_active_date == today: no change

        user.last_active_date = today

        # Streak milestones
        if user.streak_count == 3:
            bonus_neurons = NEURONS_STREAK_3
            streak_milestone = 3
            user.neurons_balance += bonus_neurons
            db.add(NeuronsTransaction(id=uuid.uuid4(), user_id=user.id, amount=bonus_neurons, action_type=ActionType.STREAK_3_DAY))
        elif user.streak_count == 7:
            bonus_neurons = NEURONS_STREAK_7
            streak_milestone = 7
            user.neurons_balance += bonus_neurons
            db.add(NeuronsTransaction(id=uuid.uuid4(), user_id=user.id, amount=bonus_neurons, action_type=ActionType.STREAK_7_DAY))
        elif user.streak_count == 30:
            bonus_neurons = NEURONS_STREAK_30
            streak_milestone = 30
            user.neurons_balance += bonus_neurons
            db.add(NeuronsTransaction(id=uuid.uuid4(), user_id=user.id, amount=bonus_neurons, action_type=ActionType.STREAK_30_DAY))

    await db.flush()

    return {
        "session_id": str(session.id),
        "new_neurons_balance": user.neurons_balance,
        "new_streak": user.streak_count,
        "bonus_neurons": bonus_neurons,
        "streak_milestone": streak_milestone,
    }


async def _compute_stats(user: User, db: AsyncSession) -> dict:
    today = date.today()
    week_ago = today - timedelta(days=7)

    # Today's deep work minutes
    r1 = await db.execute(
        select(func.sum(StudySession.duration_minutes)).where(
            and_(
                StudySession.user_id == user.id,
                StudySession.phase == "work",
                StudySession.completed == True,
                func.date(StudySession.created_at) == today,
            )
        )
    )
    today_minutes = r1.scalar() or 0

    # Total deep work minutes
    r2 = await db.execute(
        select(func.sum(StudySession.duration_minutes)).where(
            and_(
                StudySession.user_id == user.id,
                StudySession.phase == "work",
                StudySession.completed == True,
            )
        )
    )
    total_minutes = r2.scalar() or 0

    # Fluency score: avg ease_factor over last 7 days (ease_factor range 1.3–2.5 → normalize to 0–1)
    r3 = await db.execute(
        select(func.avg(Flashcard.ease_factor)).where(
            and_(
                Flashcard.user_id == user.id,
                Flashcard.next_review_date >= week_ago,
            )
        )
    )
    avg_ease = r3.scalar() or 1.3
    # Normalize: 1.3 → 0.0, 2.5 → 1.0
    fluency_score = round(min(1.0, max(0.0, (float(avg_ease) - 1.3) / 1.2)), 3)

    # Tasks today
    r4 = await db.execute(
        select(func.count(Task.id)).where(
            and_(
                Task.user_id == user.id,
                Task.due_date == today,
                Task.deleted_at == None,
            )
        )
    )
    tasks_total = r4.scalar() or 0

    r5 = await db.execute(
        select(func.count(Task.id)).where(
            and_(
                Task.user_id == user.id,
                Task.due_date == today,
                Task.completed == True,
                Task.deleted_at == None,
            )
        )
    )
    tasks_completed = r5.scalar() or 0

    return {
        "today_deep_work_minutes": today_minutes,
        "total_deep_work_minutes": total_minutes,
        "current_streak": user.streak_count,
        "neurons_balance": user.neurons_balance,
        "fluency_score": fluency_score,
        "tasks_today": {"total": tasks_total, "completed": tasks_completed},
    }


@router.get("/stats")
async def get_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cache_key = f"stats:{user.id}"

    # Try Redis cache
    if _redis_available:
        try:
            redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            cached = await redis.get(cache_key)
            if cached:
                await redis.aclose()
                return json.loads(cached)
        except Exception:
            pass

    data = await _compute_stats(user, db)

    # Store in Redis for 60s
    if _redis_available:
        try:
            redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await redis.setex(cache_key, 60, json.dumps(data))
            await redis.aclose()
        except Exception:
            pass

    return data
