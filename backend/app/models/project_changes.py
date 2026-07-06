import enum
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Enum, func, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class ProjectActions(str, enum.Enum):
    CREATED = "created"
    UPDATED = "updated"

class ProjectChange(Base):
    __tablename__ = "project_changes"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(
        Enum(
            ProjectActions,
            name="projectchangeaction",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    changed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    changes = Column(JSON, nullable=True)

    project = relationship("Project", foreign_keys=[project_id])
    user = relationship("User", foreign_keys=[user_id])
