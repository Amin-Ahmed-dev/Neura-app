import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer)
    subject: Mapped[str] = mapped_column(String(100), default="عام")
    neurons_earned: Mapped[int] = mapped_column(Integer, default=0)
    phase: Mapped[str] = mapped_column(String(10))  # 'work' | 'break'
    completed: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="study_sessions")  # type: ignore[name-defined]


class SleepSession(Base):
    __tablename__ = "sleep_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    sleep_start: Mapped[datetime] = mapped_column(DateTime)
    sleep_end: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
