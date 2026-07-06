from fastapi import HTTPException, status
from sqlalchemy import null
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project, ProjectStatus
from app.repositories.project_repo import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectImportRow, ProjectImportResponse, ImportRowError
from datetime import date, datetime, timezone
import enum
from app.models.project_changes import ProjectActions, ProjectChange
from app.repositories.project_change_repo import ProjectChangeRepository
from app.schemas.project_change import ProjectChangeResponse

def _tamamlanma_for_status(durum: ProjectStatus, manual):
    """Duruma göre tamamlanma yüzdesini belirler."""
    if durum == ProjectStatus.TAMAMLANDI:
        return 100
    if durum == ProjectStatus.BEKLEMEDE:
        return 0
    return manual if manual is not None else 0

def _serialize_change_value(value):
    if isinstance(value, enum.Enum):
        return value.value
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value

def _build_changes(project, update_data: dict) -> dict:
    changes = {}
    for field, new_value in update_data.items():
        old_value = getattr(project, field)
        old_serialized = _serialize_change_value(old_value)
        new_serialized = _serialize_change_value(new_value)
        if old_serialized != new_serialized:
            changes[field] = {"old": old_serialized, "new": new_serialized}
    return changes

class ProjectService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = ProjectRepository(db)
        self.change_repo = ProjectChangeRepository(db)
    
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

        await self.change_repo.create(project_id=db_project.id, user_id=user_id, action=ProjectActions.CREATED, changes={"title": db_project.title})
        
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
        changes = _build_changes(project, update_data)
        project.last_modified_by_id = user_id
        updated = await self.repo.update(project, ProjectUpdate(**update_data))

        await self.change_repo.create(project_id=project_id, user_id=user_id, action=ProjectActions.UPDATED, changes=changes or None)
        return updated
    
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
    
    async def get_recent_changes(self, limit: int=30) -> list[ProjectChangeResponse]:
        rows = await self.change_repo.get_recent(limit=limit)
        result = []

        for row in rows:
            project_title = row.project.title if row.project else None
            if project_title is None and row.changes:
                project_title = row.changes.get("title")
            
            result.append(ProjectChangeResponse(
                id=row.id,
                project_id=row.project_id,
                action=row.action.value if hasattr(row.action, "value") else row.action,
                changed_at=row.changed_at,
                changes=row.changes,
                user=row.user,
                project_title=project_title
            ))
        return result

    async def get_unread_changes_count(self, activity_last_viewed_at: datetime | None, user_id: int) -> int:
        if activity_last_viewed_at is None:
            return 0
        return await self.change_repo.count_since(
            activity_last_viewed_at,
            exclude_user_id=user_id,
        )

    async def mark_changes_viewed(self, user) -> None:
        user.activity_last_viewed_at = datetime.now(timezone.utc)
        await self.repo.session.flush()