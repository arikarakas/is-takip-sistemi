from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project, ProjectStatus
from app.repositories.base import BaseRepository
from app.schemas.project import ProjectCreate, ProjectUpdate

class ProjectRepository(BaseRepository[Project]):
    def __init__(self, session:AsyncSession):
        super().__init__(session)
    
    async def get_by_id(self, project_id: int):
        result = await self.session.execute(select(Project).where(Project.id == project_id))
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int=0, limit: int=100):
        result = await self.session.execute(select(Project).offset(skip).limit(limit).order_by(Project.guncel_sira))
        return list(result.scalars().all())
    
    async def get_by_status(self, status: ProjectStatus, skip: int=0, limit: int=100):
        result = await self.session.execute(select(Project).where(Project.durum == status).offset(skip).limit(limit).order_by(Project.guncel_sira.asc()))
        return list(result.scalars().all())
    
    async def create(self, data: ProjectCreate):
        project = Project(**data.model_dump())
        self.session.add(project)
        await self.session.flush()
        await self.session.refresh(project)
        return project

    async def update(self, project: Project, data: ProjectUpdate):
        for field, value in data.model_dump(exclude_unset=True).items():
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