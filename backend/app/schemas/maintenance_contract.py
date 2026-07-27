from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.monthly_invoice import MonthlyInvoiceStatus


class MonthlyInvoiceBase(BaseModel):
    year: int = Field(..., description="Fatura yılı (örn: 2026).")
    month: int = Field(..., ge=1, le=12, description="Ay numarası (1-12).")
    amount: Optional[Decimal] = Field(None, description="Kesilen fatura / bakım bedeli.")
    status: MonthlyInvoiceStatus = Field(
        MonthlyInvoiceStatus.EMPTY,
        description="completed, planned, postponed, failed veya empty.",
    )
    notes: Optional[str] = Field(None, max_length=255)


class MonthlyInvoiceCreate(MonthlyInvoiceBase):
    pass


class MonthlyInvoiceResponse(MonthlyInvoiceBase):
    id: int
    contract_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MaintenanceContractBase(BaseModel):
    company_name: str = Field(..., max_length=200, description="Firma / bakım anlaşmalı adı.")
    maintenance_count: int = Field(1, description="Yıllık bakım adedi.")
    period_type: Optional[str] = Field(None, max_length=50, description="Bakım dönemi (örn: 3AYDA1).")
    start_date: Optional[date] = Field(None, description="Sözleşme başlama tarihi.")
    end_date: Optional[date] = Field(None, description="Sözleşme bitiş tarihi.")
    total_amount: Decimal = Field(Decimal("0.0"), description="Sözleşme bedeli TL.")
    payment_term: Optional[str] = Field(None, max_length=50, description="Dönem vadeleri (örn: 30 GÜN).")
    period_amount: Decimal = Field(Decimal("0.0"), description="Dönem bedeli TL.")


class MaintenanceContractCreate(MaintenanceContractBase):
    pass


class MaintenanceContractUpdate(BaseModel):
    company_name: Optional[str] = Field(None, max_length=200)
    maintenance_count: Optional[int] = None
    period_type: Optional[str] = Field(None, max_length=50)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_amount: Optional[Decimal] = None
    payment_term: Optional[str] = Field(None, max_length=50)
    period_amount: Optional[Decimal] = None


class MaintenanceContractResponse(MaintenanceContractBase):
    id: int
    created_at: datetime
    total_invoiced_amount: Decimal = Field(
        Decimal("0.0"),
        description="Tamamlanan aylık bakımlardaki kesilen fatura toplamı.",
    )
    invoices: list[MonthlyInvoiceResponse] = Field(
        default_factory=list,
        validation_alias="monthly_invoices",
    )

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class MonthlyInvoiceUpsert(BaseModel):
    year: int = Field(..., description="Fatura yılı.")
    month: int = Field(..., ge=1, le=12, description="Ay numarası (1-12).")
    amount: Optional[Decimal] = Field(None, description="Kesilen fatura / bakım bedeli.")
    status: MonthlyInvoiceStatus = Field(
        MonthlyInvoiceStatus.EMPTY,
        description="completed, planned, postponed, failed veya empty.",
    )
    notes: Optional[str] = Field(None, max_length=255)
