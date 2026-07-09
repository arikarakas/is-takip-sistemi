from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project, ProjectStatus
from app.models.project_assignments import ProjectAssignment
from app.repositories.base import BaseRepository
from app.schemas.project import ProjectCreate, ProjectUpdate
from sqlalchemy.orm import selectinload

_PROJECT_LOAD_OPTIONS = (
    selectinload(Project.last_modified_by),
    selectinload(Project.assignments),
)

class ProjectRepository(BaseRepository[Project]):
    def __init__(self, session:AsyncSession):
        super().__init__(session)
    
    async def get_by_id(self, project_id: int):
        result = await self.session.execute(
            select(Project)
            .options(*_PROJECT_LOAD_OPTIONS)
            .where(Project.id == project_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int=0, limit: int=100):
        result = await self.session.execute(
            select(Project)
            .options(*_PROJECT_LOAD_OPTIONS)
            .offset(skip)
            .limit(limit)
            .order_by(Project.guncel_sira)
        )
        return list(result.scalars().all())
    
    async def get_by_status(self, status: ProjectStatus, skip: int=0, limit: int=100):
        result = await self.session.execute(
            select(Project)
            .options(*_PROJECT_LOAD_OPTIONS)
            .where(Project.durum == status)
            .offset(skip)
            .limit(limit)
            .order_by(Project.guncel_sira.asc())
        )
        return list(result.scalars().all())

    async def get_assigned_to_user(self, user_id: int, skip: int = 0, limit: int = 100):
        result = await self.session.execute(
            select(Project)
            .join(ProjectAssignment, ProjectAssignment.project_id == Project.id)
            .where(ProjectAssignment.assigned_user_id == user_id)
            .options(*_PROJECT_LOAD_OPTIONS)
            .order_by(Project.guncel_sira)
            .offset(skip)
            .limit(limit)
            .distinct()
        )
        return list(result.scalars().all())
    
    async def create(self, data: ProjectCreate):
        project = Project(
            **data.model_dump(exclude={"assigned_user_ids", "assigned_custom_names"})
        )
        self.session.add(project)
        await self.session.flush()
        await self.session.refresh(project)
        return project

    async def update(self, project: Project, data: ProjectUpdate):
        update_data = data.model_dump(
            exclude_unset=True,
            exclude={"assigned_user_ids", "assigned_custom_names"},
        )
        for field, value in update_data.items():
            setattr(project, field, value)
        await self.session.flush()
        await self.session.refresh(project)
        return project

    async def delete(self, project: Project):
        await self.session.delete(project)
    
    async def get_max_sira(self):
        result = await self.session.execute(select(func.max(Project.sira)))
        max_value = result.scalar()
        return max_value if max_value is not None else 0

    async def get_max_guncel_sira(self):
        result = await self.session.execute(select(func.max(Project.guncel_sira)))
        max_value = result.scalar()
        return max_value if max_value is not None else 0