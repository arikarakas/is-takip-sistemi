"""add_maintenance_contracts_and_monthly_invoices

Revision ID: d332165fcaf5
Revises: afca6e980f86
Create Date: 2026-07-24 15:21:49.286948

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "d332165fcaf5"
down_revision: Union[str, Sequence[str], None] = "afca6e980f86"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

monthly_invoice_status = postgresql.ENUM(
    "completed",
    "planned",
    "postponed",
    "failed",
    "empty",
    name="monthlyinvoicestatus",
    create_type=False,
)


def upgrade() -> None:
    op.execute(
        """
        DO $$ BEGIN
            CREATE TYPE monthlyinvoicestatus AS ENUM (
                'completed', 'planned', 'postponed', 'failed', 'empty'
            );
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
        """
    )

    op.create_table(
        "maintenance_contracts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_name", sa.String(length=200), nullable=False),
        sa.Column("maintenance_count", sa.Integer(), nullable=False),
        sa.Column("period_type", sa.String(length=50), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("total_amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("payment_term", sa.String(length=50), nullable=True),
        sa.Column("period_amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column(
            "total_invoiced_amount",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
            server_default="0",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_maintenance_contracts_id"),
        "maintenance_contracts",
        ["id"],
        unique=False,
    )

    op.create_table(
        "monthly_invoices",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("contract_id", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column(
            "status",
            monthly_invoice_status,
            nullable=False,
            server_default="empty",
        ),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["contract_id"],
            ["maintenance_contracts.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "contract_id",
            "year",
            "month",
            name="uq_monthly_invoices_contract_year_month",
        ),
    )
    op.create_index(
        op.f("ix_monthly_invoices_contract_id"),
        "monthly_invoices",
        ["contract_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_monthly_invoices_id"),
        "monthly_invoices",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_monthly_invoices_id"), table_name="monthly_invoices")
    op.drop_index(op.f("ix_monthly_invoices_contract_id"), table_name="monthly_invoices")
    op.drop_table("monthly_invoices")
    op.drop_index(op.f("ix_maintenance_contracts_id"), table_name="maintenance_contracts")
    op.drop_table("maintenance_contracts")
    op.execute("DROP TYPE IF EXISTS monthlyinvoicestatus")
