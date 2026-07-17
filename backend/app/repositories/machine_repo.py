from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.machine import Machine
from app.repositories.base import BaseRepository
from app.schemas.machine import MachineCreate, MachineUpdate

_MACHINE_LOAD_OPTIONS = (selectinload(Machine.last_modified_by),)

class MachineRepository(BaseRepository[Machine]):
    def __init__(self, session: AsyncSession):
        super().__init__(session)
    
    async def get_by_id(self, machine_id: int):
        result = await self.session.execute(
            select(Machine)
            .options(*_MACHINE_LOAD_OPTIONS)
            .where(Machine.id == machine_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int=0, limit: int=100):
        result = await self.session.execute(
            select(Machine)
            .options(*_MACHINE_LOAD_OPTIONS)
            .offset(skip)
            .limit(limit)
            .order_by(Machine.sira)
        )
        return list(result.scalars().all())
    
    async def get_by_status(self, status: bool, skip: int = 0, limit: int = 100):
        result = await self.session.execute(
            select(Machine)
            .options(*_MACHINE_LOAD_OPTIONS)
            .where(Machine.bakim == status)
            .offset(skip)
            .limit(limit)
            .order_by(Machine.sira)
        )
        return list(result.scalars().all())
    
    async def create(self, data: MachineCreate):
        machine = Machine(**data.model_dump())
        self.session.add(machine)
        await self.session.flush()
        await self.session.refresh(machine)
        return machine
    
    async def update(self, machine: Machine, data: MachineUpdate):
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(machine, field, value)
        await self.session.flush()
        await self.session.refresh(machine)
        return machine
    
    async def delete(self, machine: Machine):
        await self.session.delete(machine)

    async def get_max_sira(self) -> int:
        result = await self.session.execute(select(func.max(Machine.sira)))
        max_value = result.scalar()
        return max_value if max_value is not None else 0