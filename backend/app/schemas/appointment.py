from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


def _to_naive_datetime(value: datetime | None) -> datetime | None:
    if value is None or value.tzinfo is None:
        return value
    return value.replace(tzinfo=None)


class AppointmentBase(BaseModel):
    title: str = Field(..., description="Randevu başlığı.")
    description: Optional[str] = Field(None, description="Detaylar")
    start_time: datetime = Field(..., description="Randevu tarihi.")
    end_time: Optional[datetime] = Field(None, description="Randevu bitiş tarihi.")
    client_name: Optional[str] = Field(None, description="Randevu kiminle")

    @field_validator("start_time", "end_time", mode="after")
    @classmethod
    def normalize_datetime(cls, value: datetime | None) -> datetime | None:
        return _to_naive_datetime(value)

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    client_name: Optional[str] = None

    @field_validator("start_time", "end_time", mode="after")
    @classmethod
    def normalize_datetime(cls, value: datetime | None) -> datetime | None:
        return _to_naive_datetime(value)

class AppointmentResponse(AppointmentBase):
    id: int
    model_config = {"from_attributes": True}