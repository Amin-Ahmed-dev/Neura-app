"""Add creator_profiles, creator_content, affiliate_codes, affiliate_redemptions, sponsored_events; add account_type to users

Revision ID: 0005
Revises: 0004
Create Date: 2026-03-16
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add account_type to users
    op.add_column("users", sa.Column("account_type", sa.String(20), nullable=False, server_default="student"))

    op.create_table(
        "creator_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, unique=True, index=True),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column("bio", sa.Text, nullable=True),
        sa.Column("subjects", sa.String(500), nullable=False, server_default="[]"),
        sa.Column("national_id_hash", sa.String(64), nullable=True),
        sa.Column("credentials_url", sa.String(1000), nullable=True),
        sa.Column("verification_status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    op.create_table(
        "creator_content",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("creator_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("creator_profiles.id"), nullable=False, index=True),
        sa.Column("content_type", sa.String(30), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("subject", sa.String(100), nullable=False, server_default="عام"),
        sa.Column("visibility", sa.String(20), nullable=False, server_default="public"),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending_review"),
        sa.Column("content_json", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    op.create_table(
        "affiliate_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("creator_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("creator_profiles.id"), nullable=False, index=True),
        sa.Column("code", sa.String(8), nullable=False, unique=True, index=True),
        sa.Column("uses_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    op.create_table(
        "affiliate_redemptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("code_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("affiliate_codes.id"), nullable=False, index=True),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("redeemed_at", sa.DateTime, server_default=sa.func.now()),
    )

    op.create_table(
        "sponsored_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("sponsor_name", sa.String(200), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("event_date", sa.DateTime, nullable=True),
        sa.Column("location", sa.String(300), nullable=True),
        sa.Column("registration_url", sa.String(1000), nullable=False),
        sa.Column("target_subjects", sa.String(500), nullable=False, server_default="[]"),
        sa.Column("target_cities", sa.String(500), nullable=False, server_default="[]"),
        sa.Column("logo_url", sa.String(1000), nullable=True),
        sa.Column("active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("sponsored_events")
    op.drop_table("affiliate_redemptions")
    op.drop_table("affiliate_codes")
    op.drop_table("creator_content")
    op.drop_table("creator_profiles")
    op.drop_column("users", "account_type")
