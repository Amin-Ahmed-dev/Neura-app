import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Text, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class ProcessingStatus(str, enum.Enum):
    PENDING = "pending"
    CHUNKING = "chunking"
    CHUNKED = "chunked"
    COMPLETE = "complete"
    FAILED = "failed"
    CACHED = "cached"


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(300))
    file_hash: Mapped[str] = mapped_column(String(64), index=True)  # SHA-256
    file_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    page_count: Mapped[int] = mapped_column(Integer, default=0)
    subject: Mapped[str] = mapped_column(String(100), default="عام")
    processing_status: Mapped[ProcessingStatus] = mapped_column(
        Enum(ProcessingStatus), default=ProcessingStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="materials")  # type: ignore[name-defined]
    chunks: Mapped[list["MaterialChunk"]] = relationship(back_populates="material", cascade="all, delete-orphan")


class MaterialChunk(Base):
    __tablename__ = "material_chunks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    material_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("materials.id"), index=True)
    title: Mapped[str] = mapped_column(String(300))
    content: Mapped[str] = mapped_column(Text)
    subject: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_math_physics: Mapped[bool] = mapped_column(Boolean, default=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    material: Mapped["Material"] = relationship(back_populates="chunks")


class MaterialCache(Base):
    """Pre-processed results for known ministry textbooks (identified by SHA-256 hash)."""
    __tablename__ = "material_cache"

    file_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    chunks_json: Mapped[str] = mapped_column(Text)      # JSON array of chunks
    flashcards_json: Mapped[str] = mapped_column(Text)  # JSON array of flashcards
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
