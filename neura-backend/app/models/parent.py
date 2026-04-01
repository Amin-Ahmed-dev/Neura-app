import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class ParentLink(Base):
    __tablename__ = "parent_links"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), unique=True, index=True
    )
    parent_contact: Mapped[str] = mapped_column(String(200))  # phone or email
    contact_type: Mapped[str] = mapped_column(String(10))  # 'whatsapp' | 'email'
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_token: Mapped[str | None] = mapped_column(String(64), nullable=True)
    receive_reports: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    student: Mapped["User"] = relationship(back_populates="parent_link")  # type: ignore[name-defined]
