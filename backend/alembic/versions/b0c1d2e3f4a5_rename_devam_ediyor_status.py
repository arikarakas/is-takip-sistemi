"""rename DEVAM_EDİYOR status to DEVAM EDİYOR

Revision ID: b0c1d2e3f4a5
Revises: cb086961adfe
Create Date: 2026-07-07 14:45:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "b0c1d2e3f4a5"
down_revision: Union[str, Sequence[str], None] = "cb086961adfe"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE projectstatus ADD VALUE IF NOT EXISTS 'DEVAM EDİYOR'")

    op.execute(
        "UPDATE projects SET durum = 'DEVAM EDİYOR' WHERE durum::text = 'DEVAM_EDİYOR'"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE projects SET durum = 'DEVAM_EDİYOR' WHERE durum::text = 'DEVAM EDİYOR'"
    )
