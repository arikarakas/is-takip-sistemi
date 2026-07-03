"""expand project text columns

Revision ID: a1b2c3d4e5f6
Revises: d6a284a4f882
Create Date: 2026-07-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "d6a284a4f882"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("projects", "aciliyet", type_=sa.String(length=30), existing_nullable=True)
    op.alter_column("projects", "title", type_=sa.String(length=200), existing_nullable=False)
    op.alter_column("projects", "client", type_=sa.String(length=200), existing_nullable=False)
    op.alter_column("projects", "aksiyon", type_=sa.Text(), existing_nullable=False)
    op.alter_column("projects", "sorumlular", type_=sa.Text(), existing_nullable=False)
    op.alter_column("projects", "ilgili", type_=sa.String(length=150), existing_nullable=True)
    op.alter_column("projects", "beklenen", type_=sa.Text(), existing_nullable=True)
    op.alter_column("projects", "notlar", type_=sa.Text(), existing_nullable=True)
    op.alter_column("projects", "risk", type_=sa.Text(), existing_nullable=True)


def downgrade() -> None:
    op.alter_column("projects", "risk", type_=sa.String(length=50), existing_nullable=True)
    op.alter_column("projects", "notlar", type_=sa.String(length=100), existing_nullable=True)
    op.alter_column("projects", "beklenen", type_=sa.String(length=30), existing_nullable=True)
    op.alter_column("projects", "ilgili", type_=sa.String(length=50), existing_nullable=True)
    op.alter_column("projects", "sorumlular", type_=sa.String(), existing_nullable=False)
    op.alter_column("projects", "aksiyon", type_=sa.String(), existing_nullable=False)
    op.alter_column("projects", "client", type_=sa.String(length=100), existing_nullable=False)
    op.alter_column("projects", "title", type_=sa.String(length=100), existing_nullable=False)
    op.alter_column("projects", "aciliyet", type_=sa.String(length=20), existing_nullable=True)
