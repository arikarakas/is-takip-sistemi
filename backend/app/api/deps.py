from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security.jwt import decode_token
from app.core.security.rate_limit import make_rate_limiter
from app.models import User
from app.services.machine_service import MachineService
from app.services.project_service import ProjectService
from app.services.appointment_service import AppointmentService
from app.services.maintenance_contract_service import MaintenanceContractService

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
)

DatabaseDep = Annotated[AsyncSession, Depends(get_db)]
TokenDep = Annotated[str | None, Depends(oauth2_scheme)]


async def get_current_user_id(token: TokenDep) -> str:
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik doğrulama gerekli.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    subject = payload.get("sub")
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return str(subject)

CurrentUserIdDep = Annotated[str, Depends(get_current_user_id)]


async def get_current_user(
    db: DatabaseDep,
    username: CurrentUserIdDep,
) -> User:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı veya hesap pasif.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]


async def require_admin(current_user: CurrentUserDep) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için yönetici yetkisi gerekli.",
        )
    return current_user


AdminUserDep = Annotated[User, Depends(require_admin)]

ImportRateLimitDep = Annotated[
    None,
    Depends(
        make_rate_limiter(
            "import",
            settings.API_RATE_LIMIT_IMPORT_MAX,
            settings.API_RATE_LIMIT_IMPORT_WINDOW_SECONDS,
        )
    ),
]


async def get_project_service(db: DatabaseDep) -> ProjectService:
    return ProjectService(db)


ProjectServiceDep = Annotated[ProjectService, Depends(get_project_service)]

async def get_machine_service(db: DatabaseDep) -> MachineService:
    return MachineService(db)

MachineServiceDep = Annotated[MachineService, Depends(get_machine_service)]

async def get_appointment_service(db: DatabaseDep) -> AppointmentService:
    return AppointmentService(db)

AppointmentServiceDep = Annotated[AppointmentService, Depends(get_appointment_service)]


async def get_maintenance_contract_service(db: DatabaseDep) -> MaintenanceContractService:
    return MaintenanceContractService(db)


MaintenanceContractServiceDep = Annotated[
    MaintenanceContractService,
    Depends(get_maintenance_contract_service),
]