from functools import lru_cache
from typing import Literal
from urllib.parse import quote_plus

from pydantic import Field, computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "Sungurlar İş Takip Sistemi"
    VERSION: str = "0.1.0"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = False

    API_V1_PREFIX: str = "/api/v1"

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = Field(..., min_length=1)
    POSTGRES_DB: str = "is_takip_db"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        user = quote_plus(self.POSTGRES_USER)
        password = quote_plus(self.POSTGRES_PASSWORD)
        database = quote_plus(self.POSTGRES_DB)
        return (
            f"postgresql+asyncpg://{user}:{password}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{database}"
        )

    JWT_SECRET_KEY: str = Field(
        ...,
        min_length=32,
        description="HS256 imzalama için güçlü, rastgele bir secret key kullanın.",
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    LOGIN_MAX_ATTEMPTS: int = Field(
        5,
        ge=1,
        description="Hesap başına izin verilen başarısız giriş denemesi (kilitleme penceresi içinde).",
    )
    LOGIN_LOCKOUT_SECONDS: int = Field(
        900,
        ge=60,
        description="Hesap kilidi ve IP penceresi süresi (saniye). Varsayılan: 15 dakika.",
    )
    LOGIN_IP_MAX_ATTEMPTS: int = Field(
        10,
        ge=1,
        description="Tek IP adresinden izin verilen toplam giriş denemesi (kısa pencere içinde).",
    )
    LOGIN_IP_WINDOW_SECONDS: int = Field(
        60,
        ge=10,
        description="IP bazlı giriş denemesi penceresi (saniye).",
    )

    IMPORT_MAX_FILE_SIZE_MB: int = Field(
        20,
        ge=1,
        le=100,
        description="İçe aktarma için maksimum dosya boyutu (MB).",
    )

    API_RATE_LIMIT_IMPORT_MAX: int = Field(
        5,
        ge=1,
        description="Import endpoint'i için IP başına izin verilen istek sayısı.",
    )
    API_RATE_LIMIT_IMPORT_WINDOW_SECONDS: int = Field(
        60,
        ge=10,
        description="Import rate limit penceresi (saniye).",
    )
    API_RATE_LIMIT_USERS_MAX: int = Field(
        60,
        ge=1,
        description="Kullanıcı CRUD endpoint'leri için IP başına izin verilen istek sayısı.",
    )
    API_RATE_LIMIT_USERS_WINDOW_SECONDS: int = Field(
        60,
        ge=10,
        description="Kullanıcı CRUD rate limit penceresi (saniye).",
    )

    @computed_field
    @property
    def IMPORT_MAX_FILE_SIZE_BYTES(self) -> int:
        return self.IMPORT_MAX_FILE_SIZE_MB * 1024 * 1024

    CORS_ORIGINS: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
