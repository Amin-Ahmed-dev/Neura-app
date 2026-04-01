import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    plan_type: Mapped[str] = mapped_column(String(20))   # 'pro' | 'family'
    status: Mapped[str] = mapped_column(String(20), default="active")  # 'active' | 'cancelled' | 'expired'
    paymob_subscription_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    amount_egp: Mapped[int] = mapped_column(Integer, default=0)
    billing_cycle_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    billing_cycle_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="subscription")  # type: ignore[name-defined]
