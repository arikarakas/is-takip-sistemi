from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.monthly_invoice import MonthlyInvoiceStatus
from app.repositories.maintenance_contract_repo import MaintenanceContractRepository
from app.schemas.maintenance_contract import (
    MaintenanceContractCreate,
    MaintenanceContractUpdate,
    MonthlyInvoiceUpsert,
)


class MaintenanceContractService:
    def __init__(self, session: AsyncSession):
        self.contract_repo = MaintenanceContractRepository(session)

    async def get_all_contracts(self, year: int):
        return await self.contract_repo.get_all_contracts(year=year)

    async def get_contract_by_id(self, contract_id: int):
        contract = await self.contract_repo.get_by_id(contract_id)
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{contract_id} ID'li bakım anlaşması sistemde bulunamadı.",
            )
        return contract

    async def create_contract(self, data: MaintenanceContractCreate):
        return await self.contract_repo.create_contract(data)

    async def update_contract(self, contract_id: int, data: MaintenanceContractUpdate):
        contract = await self.get_contract_by_id(contract_id)
        return await self.contract_repo.update_contract(contract, data)

    async def delete_contract(self, contract_id: int) -> None:
        contract = await self.get_contract_by_id(contract_id)
        await self.contract_repo.delete_contract(contract)

    async def upsert_monthly_invoice(self, contract_id: int, data: MonthlyInvoiceUpsert):
        contract = await self.get_contract_by_id(contract_id)
        amount = data.amount
        if data.status == MonthlyInvoiceStatus.COMPLETED and amount is None:
            amount = contract.period_amount
        return await self.contract_repo.upsert_monthly_invoice(
            contract_id=contract_id,
            year=data.year,
            month=data.month,
            amount=amount,
            status=data.status,
            notes=data.notes,
        )
