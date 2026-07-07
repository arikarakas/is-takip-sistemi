"""revert project status data to match model

Revision ID: f1a2b3c4d5e6
Revises: c8f1a2b3d4e5
Create Date: 2026-07-06 18:10:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, Sequence[str], None] = "e7f8a9b0c1d2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE projects SET durum = 'AÇIK' WHERE durum::text = 'TEKLİF'")
    op.execute(
        "UPDATE projects SET durum = 'DEVAM_EDİYOR' WHERE durum::text = 'DEVAM EDİYOR'"
    )


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE projectstatus ADD VALUE IF NOT EXISTS 'TEKLİF'")
        op.execute("ALTER TYPE projectstatus ADD VALUE IF NOT EXISTS 'DEVAM EDİYOR'")

    op.execute("UPDATE projects SET durum = 'TEKLİF' WHERE durum::text = 'AÇIK'")
    op.execute(
        "UPDATE projects SET durum = 'DEVAM EDİYOR' WHERE durum::text = 'DEVAM_EDİYOR'"
    )
