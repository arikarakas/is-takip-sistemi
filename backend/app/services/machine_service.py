from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.machine import Machine
from app.repositories.machine_repo import MachineRepository
from app.schemas.machine import (
    MachineCreate,
    MachineImportResponse,
    MachineImportRow,
    MachineImportRowError,
    MachineUpdate,
)


class MachineService:
    def __init__(self, session: AsyncSession):
        self.machine_repo = MachineRepository(session)

    async def create_machine(self, data: MachineCreate, user_id: int):
        next_sira = (await self.machine_repo.get_max_sira()) + 1
        machine_data = data.model_dump()
        machine_data["sira"] = next_sira
        machine_data["last_modified_by_id"] = user_id
        db_machine = Machine(**machine_data)
        self.machine_repo.session.add(db_machine)
        await self.machine_repo.session.flush()
        await self.machine_repo.session.refresh(db_machine, attribute_names=["last_modified_by"])
        return db_machine

    async def get_machine_by_id(self, machine_id: int):
        machine = await self.machine_repo.get_by_id(machine_id)
        if not machine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{machine_id} ID'li makine sistemde bulunamadı."
            )
        return machine

    async def get_all_machines(self, skip: int = 0, limit: int = 100):
        return await self.machine_repo.get_all(skip=skip, limit=limit)

    async def get_machines_by_status(self, status: bool, skip: int = 0, limit: int = 100):
        return await self.machine_repo.get_by_status(status=status, skip=skip, limit=limit)

    async def update_machine(self, machine_id: int, data: MachineUpdate, user_id: int):
        db_machine = await self.get_machine_by_id(machine_id)
        update_data = data.model_dump(exclude_unset=True)
        update_data["last_modified_by_id"] = user_id
        return await self.machine_repo.update(
            machine=db_machine,
            data=MachineUpdate(**update_data),
        )

    async def delete_machine(self, machine_id: int) -> None:
        machine = await self.get_machine_by_id(machine_id)
        await self.machine_repo.delete(machine)

    async def import_machines(
        self,
        rows: list[MachineImportRow],
        header_row: int,
        parse_errors: list[tuple[int, str]] | None = None,
    ) -> MachineImportResponse:
        """Excel/CSV satırlarını toplu olarak içe aktarır."""
        imported = 0
        next_sira = (await self.machine_repo.get_max_sira()) + 1

        for data in rows:
            machine_data = data.model_dump()
            machine_data["sira"] = next_sira
            machine_data["last_modified_by_id"] = None
            self.machine_repo.session.add(Machine(**machine_data))
            imported += 1
            next_sira += 1

        await self.machine_repo.session.flush()

        errors = [
            MachineImportRowError(row=row_num, reason=reason)
            for row_num, reason in (parse_errors or [])
        ]
        return MachineImportResponse(
            imported=imported,
            failed=len(errors),
            skipped=0,
            header_row=header_row,
            errors=errors,
        )