from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.api.deps import AdminUserDep, DatabaseDep
from app.core.config import settings
from app.core.security import get_password_hash
from app.core.security.rate_limit import make_rate_limiter
from app.models import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter(
    dependencies=[
        Depends(
            make_rate_limiter(
                "users",
                settings.API_RATE_LIMIT_USERS_MAX,
                settings.API_RATE_LIMIT_USERS_WINDOW_SECONDS,
            )
        )
    ]
)


@router.get("/", response_model=list[UserResponse])
async def list_users(
    db: DatabaseDep,
    _: AdminUserDep,
):
    """Tüm kullanıcıları listeler. Yalnızca admin erişebilir."""
    result = await db.execute(select(User).order_by(User.id))
    return result.scalars().all()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    db: DatabaseDep,
    _: AdminUserDep,
):
    """Yeni kullanıcı oluşturur. Yalnızca admin erişebilir."""
    existing = await db.execute(
        select(User).where((User.username == data.username) | (User.email == data.email))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu kullanıcı adı veya e-posta zaten kayıtlı.",
        )

    user = User(
        username=data.username,
        email=data.email,
        full_name=data.full_name,
        role=data.role,
        hashed_password=get_password_hash(data.password),
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    db: DatabaseDep,
    current_admin: AdminUserDep,
):
    """Kullanıcı bilgilerini günceller. Yalnızca admin erişebilir."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanıcı bulunamadı.")

    if user.id == current_admin.id and data.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kendi hesabınızı pasifleştiremezsiniz.",
        )

    if data.email is not None:
        email_check = await db.execute(
            select(User).where(User.email == data.email, User.id != user_id)
        )
        if email_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu e-posta başka bir kullanıcıya ait.",
            )
        user.email = data.email

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.password is not None:
        user.hashed_password = get_password_hash(data.password)

    await db.flush()
    await db.refresh(user)
    return user
