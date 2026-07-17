from sqlalchemy import Column, Integer, String, Text, Date, Boolean
from app.models.base import TimestampMixin
from app.core.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey

class Machine(Base, TimestampMixin):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    sira = Column(Integer, nullable=False)
    ocak = Column(Text, nullable=False, index=True)
    halat_degisim_tarih = Column(Date, nullable=True)
    halat_boyu = Column(String(100), nullable=True)
    tip = Column(Text, nullable=True)
    bakim = Column(Boolean, default=False, nullable=False)
    bakim_tarih = Column(Date, nullable=True)
    marka = Column(String(30), nullable=True)
    manuel_kod = Column(String(60), nullable=True)
    last_modified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    last_modified_by = relationship("User", back_populates="machines")