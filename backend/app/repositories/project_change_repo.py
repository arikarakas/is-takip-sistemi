from datetime import datetime

from sqlalchemy import func, select
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
    
    async def count_since(self, since: datetime, *, exclude_user_id: int | None = None) -> int:
        query = select(func.count()).select_from(ProjectChange).where(
            ProjectChange.changed_at > since
        )
        if exclude_user_id is not None:
            query = query.where(ProjectChange.user_id != exclude_user_id)
        result = await self.session.execute(query)
        return result.scalar_one()