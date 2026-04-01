"""Add subscriptions table

Revision ID: 0004
Revises: 0003
Create Date: 2026-03-16
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("plan_type", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("paymob_subscription_id", sa.String(200), nullable=True),
        sa.Column("amount_egp", sa.Integer, nullable=False, server_default="0"),
        sa.Column("billing_cycle_start", sa.DateTime, nullable=True),
        sa.Column("billing_cycle_end", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("cancelled_at", sa.DateTime, nullable=True),
    )


def downgrade() -> None:
    op.drop_table("subscriptions")
