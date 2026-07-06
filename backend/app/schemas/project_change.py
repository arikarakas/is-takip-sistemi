from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field
from app.schemas.project import UserBrief


class UnreadChangesCountResponse(BaseModel):
    count: int


class ProjectChangeResponse(BaseModel):
    id: int
    project_id: Optional[int] = None
    action: str
    changed_at: datetime
    changes: Optional[dict[str, Any]] = None
    user: Optional[UserBrief] = None
    project_title: Optional[str] = Field(None, description="Proje silinmiş olsa bile başlık göstermek için")
    model_config = {"from_attributes": True}