from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.appointment import Appointment
from app.repositories.appointment_repo import AppointmentRepository
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
)


class AppointmentService:
    def __init__(self, session: AsyncSession):
        self.appointment_repo = AppointmentRepository(session)

    async def create_appointment(self, data: AppointmentCreate):
        appoint_data = data.model_dump()
        db_appointment = Appointment(**appoint_data)
        self.appointment_repo.session.add(db_appointment)
        await self.appointment_repo.session.flush()
        await self.appointment_repo.session.refresh(db_appointment)
        return db_appointment
    
    async def get_appointment_by_id(self, appoint_id: int):
        appoint = await self.appointment_repo.get_by_id(appoint_id)
        if not appoint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{appoint_id} ID'li randevu sistemde bulunamadı."
            )
        return appoint

    async def get_all_appointments(self, skip: int = 0, limit: int = 100):
        return await self.appointment_repo.get_all(skip=skip, limit=limit)

    async def update_appointment(self, appoint_id: int, data: AppointmentUpdate):
        db_appointment = await self.get_appointment_by_id(appoint_id)
        update_data = data.model_dump(exclude_unset=True)
        return await self.appointment_repo.update(
            appoint=db_appointment,
            data=AppointmentUpdate(**update_data),
        )

    async def delete_appointment(self, appoint_id: int) -> None:
        appoint = await self.get_appointment_by_id(appoint_id)
        await self.appointment_repo.delete(appoint)