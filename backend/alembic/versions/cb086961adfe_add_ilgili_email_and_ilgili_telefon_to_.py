"""add ilgili_email and ilgili_telefon to projects

Revision ID: cb086961adfe
Revises: f1a2b3c4d5e6
Create Date: 2026-07-07 09:20:18.605362

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cb086961adfe'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "projects",
        sa.Column("ilgili_email", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "projects",
        sa.Column("ilgili_telefon", sa.String(length=100), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("projects", "ilgili_telefon")
    op.drop_column("projects", "ilgili_email")
