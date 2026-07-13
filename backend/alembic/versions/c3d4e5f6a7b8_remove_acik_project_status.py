"""project schema updates: talep, tamamlanma_tarih, aksiyon nullable, remove AÇIK status

Revision ID: c3d4e5f6a7b8
Revises: 9e4a7c2b1d0f
Create Date: 2026-07-13 16:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "9e4a7c2b1d0f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("projects", sa.Column("talep", sa.Text(), nullable=True))
    op.add_column("projects", sa.Column("tamamlanma_tarih", sa.Date(), nullable=True))
    op.alter_column("projects", "aksiyon", existing_type=sa.Text(), nullable=True)

    op.execute("UPDATE projects SET durum = 'BEKLEMEDE' WHERE durum::text IN ('AÇIK', 'TEKLİF')")

    op.execute("CREATE TYPE projectstatus_new AS ENUM ('BEKLEMEDE', 'DEVAM EDİYOR', 'TAMAMLANDI')")
    op.execute(
        "ALTER TABLE projects "
        "ALTER COLUMN durum TYPE projectstatus_new "
        "USING durum::text::projectstatus_new"
    )
    op.execute("DROP TYPE projectstatus")
    op.execute("ALTER TYPE projectstatus_new RENAME TO projectstatus")


def downgrade() -> None:
    op.execute("CREATE TYPE projectstatus_old AS ENUM ('BEKLEMEDE', 'AÇIK', 'DEVAM EDİYOR', 'TAMAMLANDI')")
    op.execute(
        "ALTER TABLE projects "
        "ALTER COLUMN durum TYPE projectstatus_old "
        "USING durum::text::projectstatus_old"
    )
    op.execute("DROP TYPE projectstatus")
    op.execute("ALTER TYPE projectstatus_old RENAME TO projectstatus")

    op.alter_column("projects", "aksiyon", existing_type=sa.Text(), nullable=False)
    op.drop_column("projects", "tamamlanma_tarih")
    op.drop_column("projects", "talep")
