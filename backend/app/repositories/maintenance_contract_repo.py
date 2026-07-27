from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.maintenance_contract import MaintenanceContract
from app.models.monthly_invoice import MonthlyInvoice, MonthlyInvoiceStatus
from app.repositories.base import BaseRepository
from app.schemas.maintenance_contract import (
    MaintenanceContractCreate,
    MaintenanceContractUpdate,
)


class MaintenanceContractRepository(BaseRepository[MaintenanceContract]):
    def __init__(self, session: AsyncSession):
        super().__init__(session)

    async def get_by_id(self, contract_id: int) -> MaintenanceContract | None:
        result = await self.session.execute(
            select(MaintenanceContract)
            .options(selectinload(MaintenanceContract.monthly_invoices))
            .where(MaintenanceContract.id == contract_id)
        )
        return result.scalar_one_or_none()

    async def get_all_contracts(self, year: int) -> list[MaintenanceContract]:
        """Seçilen yıla ait faturalarıyla birlikte tüm sözleşmeleri getirir."""
        result = await self.session.execute(
            select(MaintenanceContract)
            .options(
                selectinload(
                    MaintenanceContract.monthly_invoices.and_(
                        MonthlyInvoice.year == year
                    )
                )
            )
            .order_by(MaintenanceContract.company_name)
        )
        return list(result.scalars().unique().all())

    async def create_contract(
        self,
        contract_data: MaintenanceContractCreate,
    ) -> MaintenanceContract:
        contract = MaintenanceContract(**contract_data.model_dump())
        self.session.add(contract)
        await self.session.flush()
        await self.session.refresh(contract, attribute_names=["monthly_invoices"])
        return contract

    async def update_contract(
        self,
        contract: MaintenanceContract,
        data: MaintenanceContractUpdate,
    ) -> MaintenanceContract:
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(contract, field, value)
        await self.session.flush()
        await self.session.refresh(contract, attribute_names=["monthly_invoices"])
        return contract

    async def delete_contract(self, contract: MaintenanceContract) -> None:
        await self.session.delete(contract)

    async def upsert_monthly_invoice(
        self,
        contract_id: int,
        year: int,
        month: int,
        amount: Decimal | float | None,
        status: MonthlyInvoiceStatus,
        notes: str | None,
    ) -> MonthlyInvoice:
        result = await self.session.execute(
            select(MonthlyInvoice).where(
                MonthlyInvoice.contract_id == contract_id,
                MonthlyInvoice.year == year,
                MonthlyInvoice.month == month,
            )
        )
        invoice = result.scalar_one_or_none()

        if invoice is None:
            invoice = MonthlyInvoice(
                contract_id=contract_id,
                year=year,
                month=month,
                amount=amount,
                status=status,
                notes=notes,
            )
            self.session.add(invoice)
        else:
            invoice.amount = amount
            invoice.status = status
            invoice.notes = notes

        await self.session.flush()
        await self.session.refresh(invoice)
        return invoice
