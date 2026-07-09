"""fix_project_assignments_columns

Revision ID: 9e4a7c2b1d0f
Revises: 81d8d291c4bd
Create Date: 2026-07-09 14:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9e4a7c2b1d0f"
down_revision: Union[str, Sequence[str], None] = "81d8d291c4bd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Align older DBs that still have assigned_user_name / NOT NULL user_id."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"]: col for col in inspector.get_columns("project_assignments")}

    if "assigned_user_id" in columns and not columns["assigned_user_id"]["nullable"]:
        op.alter_column(
            "project_assignments",
            "assigned_user_id",
            existing_type=sa.Integer(),
            nullable=True,
        )

    if "assigned_user_name" in columns and "assigned_custom_name" not in columns:
        op.alter_column(
            "project_assignments",
            "assigned_user_name",
            new_column_name="assigned_custom_name",
            existing_type=sa.String(),
            existing_nullable=True,
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("project_assignments")}

    if "assigned_custom_name" in columns and "assigned_user_name" not in columns:
        op.alter_column(
            "project_assignments",
            "assigned_custom_name",
            new_column_name="assigned_user_name",
            existing_type=sa.String(),
            existing_nullable=True,
        )

    op.alter_column(
        "project_assignments",
        "assigned_user_id",
        existing_type=sa.Integer(),
        nullable=False,
    )
