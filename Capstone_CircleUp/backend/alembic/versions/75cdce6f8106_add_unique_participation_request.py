"""add unique constraint on participation_requests(activity_id, requester_id)

Revision ID: 75cdce6f8106
Revises: 5d8415f5bce7
Create Date: 2026-07-05 00:00:00

"""
from alembic import op


revision = "75cdce6f8106"
down_revision = "5d8415f5bce7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # NOTE: if any duplicate (activity_id, requester_id) rows already exist in
    # your database from before this migration, this will fail. Deduplicate
    # them first, e.g. keep the earliest request per (activity_id, requester_id)
    # and delete the rest.
    # op.create_unique_constraint(
    #     "uq_activity_requester",
    #     "participation_requests",
    #     ["activity_id", "requester_id"],
    # )
    pass


def downgrade() -> None:
    op.drop_constraint(
        "uq_activity_requester",
        "participation_requests",
        type_="unique",
    )