from fastapi import APIRouter, Query, status

from app.api.deps import (
    CurrentUserDep,
    MaintenanceContractServiceDep,
)
from app.schemas.maintenance_contract import (
    MaintenanceContractCreate,
    MaintenanceContractResponse,
    MaintenanceContractUpdate,
    MonthlyInvoiceResponse,
    MonthlyInvoiceUpsert,
)

router = APIRouter()


@router.get("/", response_model=list[MaintenanceContractResponse])
async def read_all_maintenance_contracts(
    service: MaintenanceContractServiceDep,
    current_user: CurrentUserDep,
    year: int = Query(..., description="Fatura/bakım yılı (örn: 2026)."),
):
    """Seçilen yıla ait tüm bakım anlaşmalarını ve aylık fatura verilerini listeler."""
    return await service.get_all_contracts(year=year)


@router.post("/", response_model=MaintenanceContractResponse, status_code=status.HTTP_201_CREATED)
async def create_maintenance_contract(
    data: MaintenanceContractCreate,
    service: MaintenanceContractServiceDep,
    _: CurrentUserDep,
):
    """Sisteme yeni bir bakım anlaşması / firma ekler."""
    return await service.create_contract(data)


@router.put("/{contract_id}", response_model=MaintenanceContractResponse)
async def update_maintenance_contract(
    contract_id: int,
    data: MaintenanceContractUpdate,
    service: MaintenanceContractServiceDep,
    _: CurrentUserDep,
):
    """Mevcut bir bakım anlaşmasının detaylarını günceller."""
    return await service.update_contract(contract_id=contract_id, data=data)


@router.post(
    "/{contract_id}/invoices",
    response_model=MonthlyInvoiceResponse,
    status_code=status.HTTP_200_OK,
)
async def upsert_monthly_invoice(
    contract_id: int,
    data: MonthlyInvoiceUpsert,
    service: MaintenanceContractServiceDep,
    _: CurrentUserDep,
):
    """Belirli bir ayın fatura/bakım hücresini ekler veya günceller."""
    return await service.upsert_monthly_invoice(contract_id=contract_id, data=data)


@router.delete("/{contract_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_maintenance_contract(
    contract_id: int,
    service: MaintenanceContractServiceDep,
    _: CurrentUserDep,
):
    """Bir bakım anlaşmasını sistemden tamamen siler."""
    await service.delete_contract(contract_id=contract_id)
    return None
