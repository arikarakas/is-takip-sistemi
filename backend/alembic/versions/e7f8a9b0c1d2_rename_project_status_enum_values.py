"""rename project status enum values

Revision ID: e7f8a9b0c1d2
Revises: c8f1a2b3d4e5
Create Date: 2026-07-06 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "e7f8a9b0c1d2"
down_revision: Union[str, Sequence[str], None] = "c8f1a2b3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE projectstatus ADD VALUE IF NOT EXISTS 'TEKLİF'")
        op.execute("ALTER TYPE projectstatus ADD VALUE IF NOT EXISTS 'DEVAM EDİYOR'")

    op.execute("UPDATE projects SET durum = 'TEKLİF' WHERE durum::text = 'AÇIK'")
    op.execute(
        "UPDATE projects SET durum = 'DEVAM EDİYOR' WHERE durum::text = 'DEVAM_EDİYOR'"
    )


def downgrade() -> None:
    op.execute("UPDATE projects SET durum = 'AÇIK' WHERE durum::text = 'TEKLİF'")
    op.execute(
        "UPDATE projects SET durum = 'DEVAM_EDİYOR' WHERE durum::text = 'DEVAM EDİYOR'"
    )
