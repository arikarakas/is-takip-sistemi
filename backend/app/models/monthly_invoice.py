import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class MonthlyInvoiceStatus(str, enum.Enum):
    COMPLETED = "completed"
    PLANNED = "planned"
    POSTPONED = "postponed"
    FAILED = "failed"
    EMPTY = "empty"


class MonthlyInvoice(Base):
    __tablename__ = "monthly_invoices"
    __table_args__ = (
        UniqueConstraint(
            "contract_id",
            "year",
            "month",
            name="uq_monthly_invoices_contract_year_month",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(
        Integer,
        ForeignKey("maintenance_contracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    amount = Column(Numeric(12, 2), nullable=True)
    status = Column(
        Enum(
            MonthlyInvoiceStatus,
            values_callable=lambda statuses: [status.value for status in statuses],
            name="monthlyinvoicestatus",
        ),
        default=MonthlyInvoiceStatus.EMPTY,
        nullable=False,
    )
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    contract = relationship("MaintenanceContract", back_populates="monthly_invoices")
