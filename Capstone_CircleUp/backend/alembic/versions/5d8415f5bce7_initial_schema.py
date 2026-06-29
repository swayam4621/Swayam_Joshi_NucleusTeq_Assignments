"""initial schema: users, activities, participation_requests

Revision ID: 5d8415f5bce7
Revises:
Create Date: 2026-06-29 00:00:00

"""
from alembic import op
import sqlalchemy as sa

revision = "5d8415f5bce7"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    activity_status = sa.Enum(
        "open", "full", "cancelled", "completed", name="activitystatus"
    )
    participation_status = sa.Enum(
        "pending", "approved", "rejected", name="participationstatus"
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("phone_number", sa.String(length=30), nullable=True),
        sa.Column("city", sa.String(length=120), nullable=True),
        sa.Column("bio", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "activities",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("creator_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=2000), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("location", sa.String(length=200), nullable=False),
        sa.Column("date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("max_participants", sa.Integer(), nullable=False),
        sa.Column("status", activity_status, nullable=False, server_default="open"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_activities_creator_id", "activities", ["creator_id"])
    op.create_index("ix_activities_category", "activities", ["category"])
    op.create_index("ix_activities_location", "activities", ["location"])
    op.create_index("ix_activities_date", "activities", ["date"])
    op.create_index("ix_activities_status", "activities", ["status"])

    op.create_table(
        "participation_requests",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("activity_id", sa.Integer(), sa.ForeignKey("activities.id"), nullable=False),
        sa.Column("requester_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", participation_status, nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("activity_id", "requester_id", name="uq_activity_requester"),
    )
    op.create_index("ix_participation_requests_activity_id", "participation_requests", ["activity_id"])
    op.create_index("ix_participation_requests_requester_id", "participation_requests", ["requester_id"])
    op.create_index("ix_participation_requests_status", "participation_requests", ["status"])


def downgrade() -> None:
    op.drop_table("participation_requests")
    op.drop_table("activities")
    op.drop_table("users")
    sa.Enum(name="participationstatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="activitystatus").drop(op.get_bind(), checkfirst=True)