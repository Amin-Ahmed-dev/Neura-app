import uuid
from datetime import datetime, date
from sqlalchemy import String, Integer, Boolean, Date, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Reward(Base):
    __tablename__ = "rewards"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    neurons_cost: Mapped[int] = mapped_column(Integer)
    partner_logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    stock_count: Mapped[int] = mapped_column(Integer, default=0)
    reward_type: Mapped[str] = mapped_column(String(20), default="promo")  # data | promo | ticket
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    reward_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rewards.id"), index=True)
    reward_code: Mapped[str] = mapped_column(String(100))
    neurons_spent: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    reward: Mapped["Reward"] = relationship()
