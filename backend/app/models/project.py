import enum
from fastapi.exceptions import FastAPIError
from sqlalchemy import CheckConstraint, Column, Integer, String, Text, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import TimestampMixin
from app.core.database import Base

class ProjectStatus(str, enum.Enum):
    BEKLEMEDE = "BEKLEMEDE"
    AÇIK = "AÇIK"
    DEVAM_EDİYOR = "DEVAM EDİYOR"
    TAMAMLANDI = "TAMAMLANDI"


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    sira = Column(Integer, unique=False, nullable=False)
    oncelik = Column(Integer, unique=False)
    aciliyet = Column(String(30), unique=False)
    title = Column(String(200), index=True, nullable=False)
    client = Column(String(200), index=True, nullable=False)
    aksiyon = Column(Text, nullable=False)
    sorumlular = Column(Text, nullable=False)
    ilgili = Column(String(150), nullable=True)
    hedef_tarih = Column(Date, nullable=True)
    durum = Column(Enum(ProjectStatus), default=ProjectStatus.BEKLEMEDE, nullable=False, index=True)
    beklenen = Column(Text, nullable=True)
    notlar = Column(Text, nullable=True)
    risk = Column(Text, nullable=True)
    guncel_sira = Column(Integer, unique=False, nullable=False)
    tamamlanma = Column(Integer, nullable=False, default=0)
    last_modified_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    last_modified_by = relationship("User", foreign_keys=[last_modified_by_id])

    __table_args__ = (
        CheckConstraint('tamamlanma >= 0 AND tamamlanma <= 100', name='check_tamamlanma_range'),
    )