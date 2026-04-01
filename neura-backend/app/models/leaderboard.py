import uuid
from datetime import datetime, date
from sqlalchemy import String, Integer, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    week_start: Mapped[date] = mapped_column(Date, index=True)
    league: Mapped[str] = mapped_column(String(20))  # 'school' | 'city' | 'national'
    weekly_neurons: Mapped[int] = mapped_column(Integer, default=0)
    rank: Mapped[int] = mapped_column(Integer, default=0)
    school_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship()  # type: ignore[name-defined]
