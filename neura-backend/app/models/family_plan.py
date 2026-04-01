import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class FamilyPlan(Base):
    __tablename__ = "family_plans"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    parent_user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    plan_type: Mapped[str] = mapped_column(String(20), default="family")
    max_students: Mapped[int] = mapped_column(Integer, default=4)
    subscription_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")  # 'active' | 'cancelled'
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    members: Mapped[list["FamilyPlanMember"]] = relationship(back_populates="plan")


class FamilyPlanMember(Base):
    __tablename__ = "family_plan_members"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    plan_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("family_plans.id"), index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    plan: Mapped["FamilyPlan"] = relationship(back_populates="members")
