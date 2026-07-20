from fastapi import APIRouter, Query, status

from app.api.deps import (
    AdminUserDep,
    AppointmentServiceDep,
)
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate,
)

router = APIRouter()


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_new_appointment(
    data: AppointmentCreate,
    service: AppointmentServiceDep,
    _: AdminUserDep,
):
    """Sisteme yeni bir randevu ekler."""
    return await service.create_appointment(data)


@router.get("/", response_model=list[AppointmentResponse])
async def read_all_appointments(
    service: AppointmentServiceDep,
    _: AdminUserDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Tüm randevularu sıralı ve sayfalandırılmış olarak listeler."""
    return await service.get_all_appointments(skip=skip, limit=limit)

@router.get("/{appoint_id}", response_model=AppointmentResponse)
async def read_appointment_by_id(
    appoint_id: int,
    service: AppointmentServiceDep,
    _: AdminUserDep,
):
    """ID numarası verilen tek bir randevunun detaylarını getirir."""
    return await service.get_appointment_by_id(appoint_id=appoint_id)


@router.put("/{appoint_id}", response_model=AppointmentResponse)
async def update_existing_appointment(
    appoint_id: int,
    data: AppointmentUpdate,
    service: AppointmentServiceDep,
    _: AdminUserDep,
):
    """Mevcut bir randevuyu günceller."""
    return await service.update_appointment(
        appoint_id=appoint_id,
        data=data,
    )


@router.delete("/{appoint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_appointment(
    appoint_id: int,
    service: AppointmentServiceDep,
    _: AdminUserDep,
):
    """Bir randevuyu sistemden tamamen siler."""
    await service.delete_appointment(appoint_id=appoint_id)
    return None
