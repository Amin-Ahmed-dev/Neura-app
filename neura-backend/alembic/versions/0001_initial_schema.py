"""Initial schema — all tables

Revision ID: 0001
Revises:
Create Date: 2026-03-16
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("firebase_uid", sa.String(128), nullable=False, unique=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("student_type", sa.String(50), nullable=False),
        sa.Column("school_name", sa.String(200), nullable=True),
        sa.Column("is_pro", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("neurons_balance", sa.Integer, nullable=False, server_default="0"),
        sa.Column("streak_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("streak_freeze_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("last_active_date", sa.Date, nullable=True),
        sa.Column("reminder_time", sa.String(5), nullable=False, server_default="19:00"),
        sa.Column("bedtime", sa.String(5), nullable=False, server_default="23:00"),
        sa.Column("wake_time", sa.String(5), nullable=False, server_default="06:30"),
        sa.Column("push_token", sa.String(500), nullable=True),
        sa.Column("notification_prefs", sa.String(1000), nullable=False,
                  server_default='{"study_reminder":true,"streak_alert":true,"leaderboard":true,"flashcard_due":true,"material_ready":true}'),
        sa.Column("show_on_leaderboard", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("allow_data_for_ai", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("deleted_at", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_users_firebase_uid", "users", ["firebase_uid"])
    op.create_index("ix_users_email", "users", ["email"])

    # ── study_sessions ─────────────────────────────────────────────────────────
    op.create_table(
        "study_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("duration_minutes", sa.Integer, nullable=False),
        sa.Column("subject", sa.String(100), nullable=False, server_default="عام"),
        sa.Column("neurons_earned", sa.Integer, nullable=False, server_default="0"),
        sa.Column("phase", sa.String(10), nullable=False),
        sa.Column("completed", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_study_sessions_user_id", "study_sessions", ["user_id"])

    # ── tasks ──────────────────────────────────────────────────────────────────
    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("subject", sa.String(100), nullable=False, server_default="عام"),
        sa.Column("estimated_minutes", sa.Integer, nullable=False, server_default="30"),
        sa.Column("due_date", sa.Date, nullable=False),
        sa.Column("completed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("rolled_over", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("deleted_at", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_tasks_user_id", "tasks", ["user_id"])

    # ── materials ──────────────────────────────────────────────────────────────
    op.create_table(
        "materials",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("file_hash", sa.String(64), nullable=False),
        sa.Column("file_url", sa.String(1000), nullable=True),
        sa.Column("page_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("subject", sa.String(100), nullable=False, server_default="عام"),
        sa.Column("processing_status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_materials_user_id", "materials", ["user_id"])
    op.create_index("ix_materials_file_hash", "materials", ["file_hash"])

    # ── material_chunks ────────────────────────────────────────────────────────
    op.create_table(
        "material_chunks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("material_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("materials.id"), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("subject", sa.String(100), nullable=True),
        sa.Column("is_math_physics", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("order_index", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_material_chunks_material_id", "material_chunks", ["material_id"])

    # ── material_cache ─────────────────────────────────────────────────────────
    op.create_table(
        "material_cache",
        sa.Column("file_hash", sa.String(64), primary_key=True),
        sa.Column("chunks_json", sa.Text, nullable=False),
        sa.Column("flashcards_json", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # ── decks ──────────────────────────────────────────────────────────────────
    op.create_table(
        "decks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("material_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("materials.id"), nullable=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("subject", sa.String(100), nullable=False, server_default="عام"),
        sa.Column("share_token", sa.String(64), nullable=True, unique=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # ── flashcards ─────────────────────────────────────────────────────────────
    op.create_table(
        "flashcards",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("deck_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("decks.id"), nullable=False),
        sa.Column("question", sa.Text, nullable=False),
        sa.Column("answer", sa.Text, nullable=False),
        sa.Column("ease_factor", sa.Float, nullable=False, server_default="2.5"),
        sa.Column("interval_days", sa.Integer, nullable=False, server_default="1"),
        sa.Column("next_review_date", sa.Date, nullable=False),
        sa.Column("repetitions", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_flashcards_user_id", "flashcards", ["user_id"])
    op.create_index("ix_flashcards_deck_id", "flashcards", ["deck_id"])

    # ── neurons_transactions ───────────────────────────────────────────────────
    op.create_table(
        "neurons_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("amount", sa.Integer, nullable=False),
        sa.Column("action_type", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_neurons_transactions_user_id", "neurons_transactions", ["user_id"])

    # ── parent_links ───────────────────────────────────────────────────────────
    op.create_table(
        "parent_links",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("parent_contact", sa.String(200), nullable=False),
        sa.Column("contact_type", sa.String(10), nullable=False),
        sa.Column("verified", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("verification_token", sa.String(64), nullable=True),
        sa.Column("receive_reports", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # ── chat_messages ──────────────────────────────────────────────────────────
    op.create_table(
        "chat_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("role", sa.String(10), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("subject", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_chat_messages_user_id", "chat_messages", ["user_id"])


def downgrade() -> None:
    op.drop_table("chat_messages")
    op.drop_table("parent_links")
    op.drop_table("neurons_transactions")
    op.drop_table("flashcards")
    op.drop_table("decks")
    op.drop_table("material_cache")
    op.drop_table("material_chunks")
    op.drop_table("materials")
    op.drop_table("tasks")
    op.drop_table("study_sessions")
    op.drop_table("users")
