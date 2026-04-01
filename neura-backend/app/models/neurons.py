import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class ActionType(str, enum.Enum):
    POMODORO_COMPLETE = "pomodoro_complete"
    TASK_COMPLETE = "task_complete"
    FLASHCARD_SESSION = "flashcard_session"
    STREAK_3_DAY = "streak_3_day"
    STREAK_7_DAY = "streak_7_day"
    STREAK_30_DAY = "streak_30_day"
    REDEMPTION = "redemption"
    STREAK_FREEZE = "streak_freeze"
    BONUS = "bonus"
    ONBOARDING_COMPLETE = "onboarding_complete"
    FIRST_MATERIAL = "first_material"
    FIRST_FLASHCARD = "first_flashcard"
    GRAYSCALE_UNLOCK = "grayscale_unlock"


class NeuronsTransaction(Base):
    __tablename__ = "neurons_transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer)  # positive = earned, negative = spent
    action_type: Mapped[ActionType] = mapped_column(Enum(ActionType))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="neurons_transactions")  # type: ignore[name-defined]
