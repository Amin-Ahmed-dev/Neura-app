import uuid
from datetime import datetime, date
from sqlalchemy import String, Boolean, Integer, Float, Date, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Deck(Base):
    __tablename__ = "decks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    material_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("materials.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(300))
    subject: Mapped[str] = mapped_column(String(100), default="عام")
    share_token: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    flashcards: Mapped[list["Flashcard"]] = relationship(
        back_populates="deck", cascade="all, delete-orphan"
    )


class Flashcard(Base):
    __tablename__ = "flashcards"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    deck_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("decks.id"), index=True)
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)

    # SM-2 spaced repetition fields
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)
    interval_days: Mapped[int] = mapped_column(Integer, default=1)
    next_review_date: Mapped[date] = mapped_column(Date)
    repetitions: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    deck: Mapped["Deck"] = relationship(back_populates="flashcards")
