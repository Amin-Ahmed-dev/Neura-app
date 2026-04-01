import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class CreatorProfile(Base):
    __tablename__ = "creator_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(100))
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    subjects: Mapped[str] = mapped_column(String(500), default="")  # JSON array string
    national_id_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    credentials_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    verification_status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/verified/rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="creator_profile")  # type: ignore[name-defined]
    content: Mapped[list["CreatorContent"]] = relationship(back_populates="creator")
    affiliate_codes: Mapped[list["AffiliateCode"]] = relationship(back_populates="creator")


class CreatorContent(Base):
    __tablename__ = "creator_content"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    creator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("creator_profiles.id"), index=True)
    content_type: Mapped[str] = mapped_column(String(30))  # 'flashcard_deck' | 'quiz' | 'pdf'
    title: Mapped[str] = mapped_column(String(300))
    subject: Mapped[str] = mapped_column(String(100), default="عام")
    visibility: Mapped[str] = mapped_column(String(20), default="public")  # 'public' | 'private'
    status: Mapped[str] = mapped_column(String(30), default="pending_review")  # pending_review/approved/rejected
    content_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON payload
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    creator: Mapped["CreatorProfile"] = relationship(back_populates="content")


class AffiliateCode(Base):
    __tablename__ = "affiliate_codes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    creator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("creator_profiles.id"), index=True)
    code: Mapped[str] = mapped_column(String(8), unique=True, index=True)
    uses_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    creator: Mapped["CreatorProfile"] = relationship(back_populates="affiliate_codes")
    redemptions: Mapped[list["AffiliateRedemption"]] = relationship(back_populates="code")


class AffiliateRedemption(Base):
    __tablename__ = "affiliate_redemptions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    code_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("affiliate_codes.id"), index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    redeemed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    code: Mapped["AffiliateCode"] = relationship(back_populates="redemptions")


class SponsoredEvent(Base):
    __tablename__ = "sponsored_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    sponsor_name: Mapped[str] = mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    registration_url: Mapped[str] = mapped_column(String(1000))
    target_subjects: Mapped[str] = mapped_column(String(500), default="[]")  # JSON array
    target_cities: Mapped[str] = mapped_column(String(500), default="[]")    # JSON array
    logo_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
