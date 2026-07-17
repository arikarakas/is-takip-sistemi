from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.user import UserBrief

class MachineBase(BaseModel):
    ocak: str = Field(..., description="Makinenin ocağı.")
    halat_degisim_tarih: Optional[date] = Field(None, description="Son halat değişim tarihi (YYYY-MM-DD)")
    halat_boyu: Optional[str] = Field(None, description="Halat boyu")
    tip: Optional[str] = Field(None, description="Makinenin tipi")
    bakim: bool = Field(False, description="Makinenin bakım durumu")
    bakim_tarih: Optional[date] = Field(None, description="Makinenin son bakım tarihi (YYYY-MM-DD)")
    marka: Optional[str] = Field(None, description="Makinenin markası")
    manuel_kod: Optional[str] = Field(None, description="Makinenin manuel kodu")

class MachineCreate(MachineBase):
    pass

class MachineUpdate(BaseModel):
    sira: Optional[int] = None
    ocak: Optional[str] = None
    halat_degisim_tarih: Optional[date] = None
    halat_boyu: Optional[str] = None
    tip: Optional[str] = None
    bakim: Optional[bool] = None
    bakim_tarih: Optional[date] = None
    marka: Optional[str] = None
    manuel_kod: Optional[str] = None

class MachineResponse(MachineBase):
    id: int
    sira: int
    created_at: datetime
    updated_at: datetime
    last_modified_by_id: Optional[int] = None
    last_modified_by: Optional[UserBrief] = None
    model_config = {"from_attributes": True}


class MachineImportRow(MachineBase):
    pass


class MachineImportRowError(BaseModel):
    row: int
    reason: str


class MachineImportResponse(BaseModel):
    imported: int
    failed: int
    skipped: int
    header_row: int = Field(..., description="Kullanılan başlık satırı (1 tabanlı)")
    errors: list[MachineImportRowError] = Field(default_factory=list)