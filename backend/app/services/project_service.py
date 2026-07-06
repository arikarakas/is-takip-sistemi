from fastapi import HTTPException, status
from sqlalchemy import null
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project, ProjectStatus
from app.repositories.project_repo import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectImportRow, ProjectImportResponse, ImportRowError

def _tamamlanma_for_status(durum: ProjectStatus, manual):
    """Duruma göre tamamlanma yüzdesini belirler."""
    if durum == ProjectStatus.TAMAMLANDI:
        return 100
    if durum == ProjectStatus.BEKLEMEDE:
        return 0
    return manual if manual is not None else 0

class ProjectService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = ProjectRepository(db)
    
    async def create_project(self, data: ProjectCreate, user_id: int):

        next_sira = (await self.repo.get_max_sira()) + 1
        next_guncel = (await self.repo.get_max_guncel_sira()) + 1

        project_data = data.model_dump()
        project_data["sira"] = next_sira
        project_data["guncel_sira"] = next_guncel
        project_data["tamamlanma"] = _tamamlanma_for_status(data.durum, data.tamamlanma)
        project_data["last_modified_by_id"] = user_id
        
        db_project = Project(**project_data)
        self.repo.session.add(db_project)
        await self.repo.session.flush()
        await self.repo.session.refresh(db_project)
        return db_project
    
    async def get_project_by_id(self, project_id: int):
        """ID'ye göre projeyi bulur"""
        project = await self.repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{project_id} ID'li proje sistemde bulunamadı."
            )
        return project
    
    async def get_all_projects(self, skip: int = 0, limit: int = 100):
        """Tüm projeleri sayfalayarak getirir."""
        return await self.repo.get_all(skip=skip, limit=limit)

    async def get_projects_by_status(self, project_status: ProjectStatus, skip: int = 0, limit: int = 100):
        """Belirli bir durumdaki projeleri filtreler."""
        return await self.repo.get_by_status(status=project_status, skip=skip, limit=limit)
    
    async def update_project(self, project_id, data: ProjectUpdate, user_id: int):
        project = await self.get_project_by_id(project_id)
        update_data = data.model_dump(exclude_unset=True)

        new_durum = update_data.get("durum", project.durum)
        if "durum" in update_data:
            update_data["tamamlanma"] = _tamamlanma_for_status(
                new_durum,
                update_data.get("tamamlanma", project.tamamlanma),
            )
        project.last_modified_by_id = user_id
        return await self.repo.update(project, ProjectUpdate(**update_data))
    
    async def delete_project(self, project_id: int) -> None:
        """Projeyi sistemden siler."""
        project = await self.get_project_by_id(project_id)
        await self.repo.delete(project)

    async def import_projects(
        self,
        rows: list[ProjectImportRow],
        header_row: int,
        parse_errors: list[tuple[int, str]] | None = None,
    ) -> ProjectImportResponse:
        """Excel/CSV satırlarını toplu olarak içe aktarır."""
        imported = 0
        next_sira = (await self.repo.get_max_sira()) + 1
        next_guncel = (await self.repo.get_max_guncel_sira()) + 1

        for data in rows:
            project_data = data.model_dump()
            project_data["sira"] = data.sira if data.sira is not None else next_sira
            project_data["guncel_sira"] = data.guncel_sira if data.guncel_sira is not None else next_guncel
            project_data["tamamlanma"] = _tamamlanma_for_status(data.durum, data.tamamlanma)
            project_data["last_modified_by_id"] = None

            self.repo.session.add(Project(**project_data))
            imported += 1
            if data.sira is None:
                next_sira += 1
            if data.guncel_sira is None:
                next_guncel += 1

        await self.repo.session.flush()

        errors = [
            ImportRowError(row=row_num, reason=reason)
            for row_num, reason in (parse_errors or [])
        ]
        return ProjectImportResponse(
            imported=imported,
            failed=len(errors),
            skipped=0,
            header_row=header_row,
            errors=errors,
        )