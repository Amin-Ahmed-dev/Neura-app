from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_pro
from app.models.user import User

router = APIRouter()


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class SleepSessionIn(BaseModel):
    sleep_start: datetime
    sleep_end: Optional[datetime] = None
    duration_minutes: Optional[int] = None


class SleepSessionOut(BaseModel):
    id: int
    sleep_start: datetime
    sleep_end: Optional[datetime]
    duration_minutes: Optional[int]
    date: str  # YYYY-MM-DD of sleep_start

    class Config:
        from_attributes = True


class SleepHistoryOut(BaseModel):
    sessions: List[dict]


class SleepInsightOut(BaseModel):
    avg_sleep_hours: float
    best_study_day_sleep: float
    insight_message: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/sleep", status_code=201)
async def log_sleep_session(
    body: SleepSessionIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sync a sleep session from the device."""
    from app.models.study_session import SleepSession  # lazy import

    session = SleepSession(
        user_id=current_user.id,
        sleep_start=body.sleep_start,
        sleep_end=body.sleep_end,
        duration_minutes=body.duration_minutes,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "status": "ok"}


@router.get("/sleep", response_model=SleepHistoryOut)
async def get_sleep_history(
    days: int = Query(default=30, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return sleep sessions for the last N days (Pro only for >7 days)."""
    from app.models.study_session import SleepSession

    cutoff = datetime.utcnow() - timedelta(days=days)
    sessions = (
        db.query(SleepSession)
        .filter(
            SleepSession.user_id == current_user.id,
            SleepSession.sleep_start >= cutoff,
        )
        .order_by(SleepSession.sleep_start.desc())
        .all()
    )

    result = [
        {
            "date": s.sleep_start.strftime("%Y-%m-%d"),
            "duration_minutes": s.duration_minutes or 0,
        }
        for s in sessions
    ]
    return {"sessions": result}


@router.get("/sleep/insights", response_model=SleepInsightOut)
async def get_sleep_insights(
    current_user: User = Depends(require_pro),
    db: Session = Depends(get_db),
):
    """Correlation between sleep duration and study performance (Pro)."""
    from app.models.study_session import SleepSession, StudySession

    cutoff = datetime.utcnow() - timedelta(days=30)

    sleep_sessions = (
        db.query(SleepSession)
        .filter(
            SleepSession.user_id == current_user.id,
            SleepSession.sleep_start >= cutoff,
            SleepSession.duration_minutes.isnot(None),
        )
        .all()
    )

    if not sleep_sessions:
        return SleepInsightOut(
            avg_sleep_hours=0,
            best_study_day_sleep=0,
            insight_message="مفيش بيانات نوم كافية لحد دلوقتي. استمر في التتبع!",
        )

    avg_minutes = sum(s.duration_minutes for s in sleep_sessions) / len(sleep_sessions)
    avg_hours = round(avg_minutes / 60, 1)

    # Find days with 7+ hours sleep and check study sessions
    good_sleep_days = [
        s.sleep_start.date()
        for s in sleep_sessions
        if (s.duration_minutes or 0) >= 420
    ]

    best_study_sleep = avg_hours
    if good_sleep_days:
        study_on_good_days = (
            db.query(StudySession)
            .filter(
                StudySession.user_id == current_user.id,
                StudySession.completed == True,
            )
            .all()
        )
        good_day_sessions = [
            s for s in study_on_good_days
            if s.created_at.date() in good_sleep_days
        ]
        if good_day_sessions:
            best_study_sleep = round(
                sum(s.duration_minutes for s in good_day_sessions) / len(good_day_sessions) / 60, 1
            )

    if avg_hours >= 7:
        msg = f"ممتاز! بتنام {avg_hours} ساعة في المتوسط. استمر كده 💪"
    elif avg_hours >= 5:
        msg = f"بتنام {avg_hours} ساعة في المتوسط. حاول توصل لـ 7-8 ساعات عشان تذاكر أحسن."
    else:
        msg = f"بتنام {avg_hours} ساعة بس! النوم القليل بيأثر على التركيز والحفظ. حاول تنام أكتر 🌙"

    return SleepInsightOut(
        avg_sleep_hours=avg_hours,
        best_study_day_sleep=best_study_sleep,
        insight_message=msg,
    )
