"""add project_changes table

Revision ID: 21987defd932
Revises: da3bc0b993ed
Create Date: 2026-07-06 08:00:28.637055

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '21987defd932'
down_revision: Union[str, Sequence[str], None] = 'da3bc0b993ed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "project_changes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column(
            "action",
            sa.Enum("created", "updated", "deleted", name="projectchangeaction"),
            nullable=False,
        ),
        sa.Column(
            "changed_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("changes", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_project_changes_id"), "project_changes", ["id"])
    op.create_index(op.f("ix_project_changes_project_id"), "project_changes", ["project_id"])
    op.create_index(op.f("ix_project_changes_changed_at"), "project_changes", ["changed_at"])



def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_project_changes_changed_at"), table_name="project_changes")
    op.drop_index(op.f("ix_project_changes_project_id"), table_name="project_changes")
    op.drop_index(op.f("ix_project_changes_id"), table_name="project_changes")
    op.drop_table("project_changes")
    op.execute("DROP TYPE IF EXISTS projectchangeaction")
