from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

ALLOWED_ROLES = ("admin", "personel")


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Kullanıcı Adı")
    email: EmailStr = Field(..., description="E-posta Adresi")
    full_name: Optional[str] = Field(None, max_length=100, description="Ad Soyad")
    role: str = Field("personel", description="Kullanıcı Rolü")

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        if value not in ALLOWED_ROLES:
            raise ValueError(f"Geçersiz rol. İzin verilen roller: {', '.join(ALLOWED_ROLES)}")
        return value


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128, description="Şifre")


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    role: Optional[Literal["admin", "personel"]] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)


class UserResponse(UserBase):
    id: int
    is_active: bool
    model_config = {"from_attributes": True}


class UserBrief(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    model_config = {"from_attributes": True}
