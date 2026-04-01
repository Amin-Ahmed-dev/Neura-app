import uuid
from datetime import datetime, date
from sqlalchemy import String, Boolean, Integer, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    firebase_uid: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    student_type: Mapped[str] = mapped_column(String(50))  # 'ثانوي عام' | 'جامعة'
    school_name: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Subscription
    is_pro: Mapped[bool] = mapped_column(Boolean, default=False)

    # Account type
    account_type: Mapped[str] = mapped_column(String(20), default="student")  # 'student' | 'creator' | 'admin'

    # Gamification
    neurons_balance: Mapped[int] = mapped_column(Integer, default=0)
    streak_count: Mapped[int] = mapped_column(Integer, default=0)
    streak_freeze_count: Mapped[int] = mapped_column(Integer, default=0)
    last_active_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Settings
    reminder_time: Mapped[str] = mapped_column(String(5), default="19:00")  # HH:MM
    bedtime: Mapped[str] = mapped_column(String(5), default="23:00")
    wake_time: Mapped[str] = mapped_column(String(5), default="06:30")
    push_token: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Notification preferences (stored as JSON string for simplicity)
    notification_prefs: Mapped[str] = mapped_column(
        String(1000),
        default='{"study_reminder":true,"streak_alert":true,"leaderboard":true,"flashcard_due":true,"material_ready":true}',
    )

    # Privacy
    show_on_leaderboard: Mapped[bool] = mapped_column(Boolean, default=False)
    allow_data_for_ai: Mapped[bool] = mapped_column(Boolean, default=False)

    # Soft delete / anonymization
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    study_sessions: Mapped[list["StudySession"]] = relationship(back_populates="user")  # type: ignore[name-defined]
    tasks: Mapped[list["Task"]] = relationship(back_populates="user")  # type: ignore[name-defined]
    materials: Mapped[list["Material"]] = relationship(back_populates="user")  # type: ignore[name-defined]
    neurons_transactions: Mapped[list["NeuronsTransaction"]] = relationship(back_populates="user")  # type: ignore[name-defined]
    parent_link: Mapped["ParentLink | None"] = relationship(back_populates="student")  # type: ignore[name-defined]
    chat_messages: Mapped[list["ChatMessage"]] = relationship(back_populates="user")  # type: ignore[name-defined]
    subscription: Mapped["Subscription | None"] = relationship(back_populates="user")  # type: ignore[name-defined]
    creator_profile: Mapped["CreatorProfile | None"] = relationship(back_populates="user")  # type: ignore[name-defined]
