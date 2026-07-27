from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project, ProjectStatus
from app.models.project_assignments import ProjectAssignment
from app.repositories.project_repo import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectImportRow, ProjectImportResponse, ImportRowError
from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo
import enum
from app.models.project_changes import ProjectActions
from app.repositories.project_change_repo import ProjectChangeRepository
from app.schemas.project_change import ProjectChangeResponse

ASSIGNMENT_FIELDS = {"assigned_user_ids", "assigned_custom_names"}

def _apply_assignments(project: Project, user_ids: list[int] | None, custom_names: list[str] | None) -> None:
    project.assignments.clear()
    for uid in user_ids or []:
        project.assignments.append(ProjectAssignment(assigned_user_id=uid))
    for name in custom_names or []:
        if name and name.strip():
            project.assignments.append(
                ProjectAssignment(assigned_user_id=None, assigned_custom_name=name.strip())
            )

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

def tamamlanma_tarihi(durum: ProjectStatus):
    """Proje tamamlandı durumuna getirilirse o günü tarihini döndürür."""
    if durum == ProjectStatus.TAMAMLANDI:
        return datetime.now(ZoneInfo("Europe/Istanbul")).date()
    return None

class ProjectService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = ProjectRepository(db)
        self.change_repo = ProjectChangeRepository(db)
    
    async def create_project(self, data: ProjectCreate, user_id: int):

        next_sira = (await self.repo.get_max_sira()) + 1
        next_guncel = (await self.repo.get_max_guncel_sira()) + 1

        project_data = data.model_dump(exclude=ASSIGNMENT_FIELDS)
        project_data["sira"] = next_sira
        project_data["guncel_sira"] = next_guncel
        project_data["tamamlanma"] = _tamamlanma_for_status(data.durum, data.tamamlanma)
        project_data["tamamlanma_tarih"] = tamamlanma_tarihi(data.durum)
        project_data["last_modified_by_id"] = user_id
        
        db_project = Project(**project_data)
        _apply_assignments(db_project, data.assigned_user_ids, data.assigned_custom_names)

        self.repo.session.add(db_project)
        await self.repo.session.flush()
        await self.repo.session.refresh(db_project, attribute_names=["assignments", "last_modified_by"])

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

    async def get_my_assigned_projects(self, user_id: int, skip: int = 0, limit: int = 100):
        """Giriş yapan kullanıcıya atanan projeleri getirir."""
        return await self.repo.get_assigned_to_user(user_id=user_id, skip=skip, limit=limit)
    
    def _user_can_edit_project(self, project: Project, user_id: int, user_role: str) -> bool:
        if user_role == "admin":
            return True
        return any(assignment.assigned_user_id == user_id for assignment in project.assignments)

    async def update_project(self, project_id, data: ProjectUpdate, user_id: int, user_role: str):
        project = await self.get_project_by_id(project_id)
        if not self._user_can_edit_project(project, user_id, user_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu projeyi düzenleme yetkiniz yok.",
            )

        update_data = data.model_dump(exclude_unset=True)

        user_ids = update_data.pop("assigned_user_ids", None)
        custom_names = update_data.pop("assigned_custom_names", None)

        new_durum = update_data.get("durum", project.durum)
        if "durum" in update_data:
            update_data["tamamlanma_tarih"] = tamamlanma_tarihi(new_durum)

        changes = _build_changes(project, update_data)
        project.last_modified_by_id = user_id

        for field, value in update_data.items():
            setattr(project, field, value)
        
        if user_ids is not None or custom_names is not None:
            _apply_assignments(
                project,
                user_ids if user_ids is not None else [
                    a.assigned_user_id for a in project.assignments if a.assigned_user_id
                ],
                custom_names if custom_names is not None else [
                    a.assigned_custom_name for a in project.assignments if a.assigned_custom_name
                ],
            )

        await self.repo.session.flush()
        await self.change_repo.create(project_id=project_id, user_id=user_id, action=ProjectActions.UPDATED, changes=changes or None)
        return await self.get_project_by_id(project_id)
    
    async def delete_project(self, project_id: int, user_role: str) -> None:
        """Projeyi sistemden siler."""
        if user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlem için yönetici yetkisi gerekli.",
            )

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
            project_data = data.model_dump(exclude=ASSIGNMENT_FIELDS)
            project_data["sira"] = data.sira if data.sira is not None else next_sira
            project_data["guncel_sira"] = data.guncel_sira if data.guncel_sira is not None else next_guncel
            project_data["tamamlanma"] = _tamamlanma_for_status(data.durum, data.tamamlanma)
            project_data["tamamlanma_tarih"] = tamamlanma_tarihi(data.durum)
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
    
    async def get_recent_changes(self, limit: int = 30) -> list[ProjectChangeResponse]:
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

    async def get_unread_changes_count(
        self,
        activity_last_viewed_at: datetime | None,
        user_id: int,
        *,
        user_role: str = "admin",
    ) -> int:
        if activity_last_viewed_at is None:
            return 0
        assigned_user_id = user_id if user_role == "personel" else None
        return await self.change_repo.count_since(
            activity_last_viewed_at,
            exclude_user_id=user_id,
            assigned_user_id=assigned_user_id,
        )

    async def mark_changes_viewed(self, user) -> None:
        user.activity_last_viewed_at = datetime.now(timezone.utc)
        await self.repo.session.flush()