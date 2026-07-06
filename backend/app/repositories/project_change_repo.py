from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.project_changes import ProjectActions, ProjectChange
from app.repositories.base import BaseRepository

class ProjectChangeRepository(BaseRepository[ProjectChange]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
    
    async def create(self, *, project_id: int, user_id: int, action: ProjectActions, changes: dict) -> ProjectChange:
        entry = ProjectChange(project_id=project_id, user_id=user_id, action=action, changes=changes)
        self.session.add(entry)
        await self.session.flush()
        await self.session.refresh(entry)
        return entry
    
    async def get_recent(self, limit: int = 30) -> list[ProjectChange]:
        result = await self.session.execute(select(ProjectChange).options(
                                    selectinload(ProjectChange.user), 
                                    selectinload(ProjectChange.project)).order_by(ProjectChange.changed_at.desc()).limit(limit))
        return list(result.scalars().all())