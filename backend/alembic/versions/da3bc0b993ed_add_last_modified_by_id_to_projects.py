"""add last_modified_by_id to projects

Revision ID: da3bc0b993ed
Revises: a1b2c3d4e5f6
Create Date: 2026-07-06 07:09:29.589405

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'da3bc0b993ed'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    
    op.add_column(
        "projects",
        sa.Column("last_modified_by_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_projects_last_modified_by_id_users",
        "projects",
        "users",
        ["last_modified_by_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        op.f("ix_projects_last_modified_by_id"),
        "projects",
        ["last_modified_by_id"],
    )



def downgrade() -> None:
    """Downgrade schema."""
    pass
