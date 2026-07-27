from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment
from app.repositories.base import BaseRepository
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


class AppointmentRepository(BaseRepository[Appointment]):
    def __init__(self, session: AsyncSession):
        super().__init__(session)
    
    async def get_by_id(self, appoint_id: int):
        result = await self.session.execute(
            select(Appointment)
            .where(Appointment.id == appoint_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int=0, limit: int=100):
        result = await self.session.execute(
            select(Appointment)
            .offset(skip)
            .limit(limit)
            .order_by(Appointment.start_time)
        )
        return list(result.scalars().all())
    
    async def create(self, data: AppointmentCreate):
        appoint = Appointment(**data.model_dump())
        self.session.add(appoint)
        await self.session.flush()
        await self.session.refresh(appoint)
        return appoint
    
    async def update(self, appoint: Appointment, data: AppointmentUpdate):
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(appoint, field, value)
        await self.session.flush()
        await self.session.refresh(appoint)
        return appoint
    
    async def delete(self, appoint: Appointment):
        await self.session.delete(appoint)