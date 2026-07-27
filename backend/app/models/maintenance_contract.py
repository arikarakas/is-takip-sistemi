from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class MaintenanceContract(Base):
    __tablename__ = "maintenance_contracts"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False)
    maintenance_count = Column(Integer, default=1, nullable=False)
    period_type = Column(String(50), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    total_amount = Column(Numeric(12, 2), default=0.0, nullable=False)
    payment_term = Column(String(50), nullable=True)
    period_amount = Column(Numeric(12, 2), default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    total_invoiced_amount = Column(Numeric(12, 2), default=0.0, nullable=False)

    monthly_invoices = relationship(
        "MonthlyInvoice",
        back_populates="contract",
        cascade="all, delete-orphan",
    )
