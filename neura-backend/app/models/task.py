import uuid
from datetime import datetime, date
from sqlalchemy import String, Boolean, Integer, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(300))
    subject: Mapped[str] = mapped_column(String(100), default="عام")
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30)
    due_date: Mapped[date] = mapped_column(Date)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    rolled_over: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="tasks")  # type: ignore[name-defined]
