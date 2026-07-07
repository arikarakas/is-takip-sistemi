from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from app.models.project import ProjectStatus

class UserBrief(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    model_config = {"from_attributes": True}

# ORTAK TEMEL ŞEMA
class ProjectBase(BaseModel):
    oncelik: Optional[int] = Field(None, description="Öncelik için sayısal değer")
    aciliyet: Optional[str] = Field(None, max_length=30, description="Aciliyet durumu")
    title: str = Field(..., min_length=1, max_length=200, description="İş / Konu Başlığı")
    client: str = Field(..., min_length=1, max_length=200, description="Müşteri Adı")
    aksiyon: str = Field(..., min_length=1, description="Aksiyon / Sonraki Adım")
    sorumlular: str = Field(..., min_length=1, description="İşten sorumlu kişiler")
    ilgili: Optional[str] = Field(None, max_length=150, description="İlgili diğer kişiler")
    ilgili_email: Optional[str] = Field(None, max_length=100, description="İlgili kişi e-posta")
    ilgili_telefon: Optional[str] = Field(None, max_length=100, description="İlgili kişi telefon")
    hedef_tarih: Optional[date] = Field(None, description="Hedef bitiş tarihi (YYYY-MM-DD)")
    durum: ProjectStatus = Field(ProjectStatus.BEKLEMEDE, description="İşin güncel durumu")
    beklenen: Optional[str] = Field(None, description="Beklenen aksiyon/durum")
    notlar: Optional[str] = Field(None, description="Ek notlar")
    risk: Optional[str] = Field(None, description="Tespit edilen riskler")
    tamamlanma: int = Field(0, description="Tamamlanma yüzdesi (0-100 arası)")

    @field_validator("tamamlanma")
    @classmethod
    def validate_tamamlanma(cls, value: int) -> int:
        if not (0 <= value <= 100):
            raise ValueError("Tamamlanma yüzdesi 0 ile 100 arasında olmalıdır.")
        return value

# YENİ İŞ OLUŞTURMA ŞEMASI
class ProjectCreate(ProjectBase):
    pass

# İŞ GÜNCELLEME ŞEMASI
class ProjectUpdate(BaseModel):
    sira: Optional[int] = None
    guncel_sira: Optional[int] = None
    oncelik: Optional[int] = None
    aciliyet: Optional[str] = None
    title: Optional[str] = None
    client: Optional[str] = None
    aksiyon: Optional[str] = None
    sorumlular: Optional[str] = None
    ilgili: Optional[str] = None
    ilgili_email: Optional[str] = None
    ilgili_telefon: Optional[str] = None
    hedef_tarih: Optional[date] = None
    durum: Optional[ProjectStatus] = None
    beklenen: Optional[str] = None
    notlar: Optional[str] = None
    risk: Optional[str] = None
    tamamlanma: Optional[int] = None

    @field_validator("tamamlanma")
    @classmethod
    def validate_tamamlanma(cls, value: Optional[int]) -> Optional[int]:
        if value is not None and not (0 <= value <= 100):
            raise ValueError("Tamamlanma yüzdesi 0 ile 100 arasında olmalıdır.")
        return value

class ProjectResponse(ProjectBase):
    id: int
    sira: int
    guncel_sira: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
    last_modified_by: Optional[UserBrief] = None
    ilgili_email: Optional[str] = None
    ilgili_telefon: Optional[str] = None


class ProjectImportRow(ProjectBase):
    sira: Optional[int] = None
    guncel_sira: Optional[int] = None


class ImportRowError(BaseModel):
    row: int
    reason: str


class ProjectImportResponse(BaseModel):
    imported: int
    failed: int
    skipped: int
    header_row: int = Field(..., description="Kullanılan başlık satırı (1 tabanlı)")
    errors: list[ImportRowError] = Field(default_factory=list)