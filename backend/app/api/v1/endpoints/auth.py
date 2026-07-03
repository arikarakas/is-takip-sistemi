from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUserDep
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.core.security.login_guard import LoginGuard
from app.models import User
from app.schemas.user import UserResponse

router = APIRouter()

INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Kullanıcı adı veya şifre hatalı.",
    headers={"WWW-Authenticate": "Bearer"},
)


@router.post("/login", response_model=dict[str, str])
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Kullanıcı adı ve şifre ile giriş yaparak JWT Access Token alma endpoint'i."""
    LoginGuard.check_ip_limit(request)
    LoginGuard.check_account_lock(form_data.username)

    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise INVALID_CREDENTIALS

    is_password_correct = verify_password(form_data.password, user.hashed_password)

    if not is_password_correct:
        LoginGuard.record_failure(form_data.username)
        raise INVALID_CREDENTIALS

    LoginGuard.record_success(form_data.username)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=form_data.username,
        expires_delta=access_token_expires,
        extra_claims={"role": user.role},
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: CurrentUserDep):
    """Oturum açmış kullanıcının bilgilerini döner."""
    return current_user
