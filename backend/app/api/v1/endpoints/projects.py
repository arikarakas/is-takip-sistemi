from fastapi import APIRouter, status, Query, UploadFile, File, HTTPException
from app.api.deps import (
    ProjectServiceDep,
    CurrentUserDep,
    AdminUserDep,
    DatabaseDep,
    ImportRateLimitDep,
)
from app.core.security.file_validation import read_import_file
from app.models.project import ProjectStatus, Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate, ProjectImportResponse
from app.services.project_import import ImportParseError, parse_import_file
from app.schemas.project_change import ProjectChangeResponse, UnreadChangesCountResponse

router = APIRouter()

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_new_project(
    data: ProjectCreate,
    service: ProjectServiceDep,
    current_user: CurrentUserDep,
):
    """Sisteme yeni bir proje ekler."""
    return await service.create_project(data, user_id=current_user.id)

@router.get("/", response_model=list[ProjectResponse])
async def read_all_projects(
    service: ProjectServiceDep,
    current_user_id: CurrentUserDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Tüm projeleri sıralı ve sayfalandırılmış olarak listeler."""
    return await service.get_all_projects(skip=skip, limit=limit)

@router.get("/status/{project_status}", response_model=list[ProjectResponse])
async def read_projects_by_status(
    project_status: ProjectStatus,
    service: ProjectServiceDep,
    current_user_id: CurrentUserDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Sadece belirli bir durumdaki projeleri filtreler."""
    return await service.get_projects_by_status(project_status=project_status, skip=skip, limit=limit)

@router.get("/assigned/me", response_model=list[ProjectResponse])
async def read_my_assigned_projects(
    service: ProjectServiceDep,
    current_user: CurrentUserDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Giriş yapan kullanıcının sorumlu olduğu projeleri listeler."""
    return await service.get_my_assigned_projects(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )

@router.post("/import", response_model=ProjectImportResponse, status_code=status.HTTP_200_OK)
async def import_projects_from_file(
    service: ProjectServiceDep,
    _: AdminUserDep,
    __: ImportRateLimitDep,
    file: UploadFile = File(...),
    header_row: int | None = Query(
        None,
        ge=1,
        le=100,
        description="Başlık satırı (1 tabanlı). Boş bırakılırsa dosyada otomatik aranır.",
    ),
):
    """Excel veya CSV dosyasından projeleri içe aktarır. Yalnızca admin erişebilir."""
    file_bytes, filename = await read_import_file(file)

    try:
        rows, detected_header_row, errors = parse_import_file(
            file_bytes,
            filename,
            header_row=header_row,
        )
    except ImportParseError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message) from exc

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="İçe aktarılacak geçerli satır bulunamadı.",
        )

    return await service.import_projects(rows, detected_header_row, errors)

@router.get("/changes/recent", response_model=list[ProjectChangeResponse])
async def read_recent_project_changes(service: ProjectServiceDep, current_user: CurrentUserDep, limit: int = Query(30, ge=1, le=100)):
    """Son proje değişikliklerini listeler"""
    return await service.get_recent_changes(limit=limit)

@router.get("/changes/unread-count", response_model=UnreadChangesCountResponse)
async def get_unread_changes_count(service: ProjectServiceDep, current_user: CurrentUserDep):
    """Son kontrolden bu yana oluşan değişiklik sayısını döner."""
    count = await service.get_unread_changes_count(
        current_user.activity_last_viewed_at,
        current_user.id,
        user_role=current_user.role,
    )
    return UnreadChangesCountResponse(count=count)

@router.patch("/changes/mark-viewed", status_code=status.HTTP_204_NO_CONTENT)
async def mark_changes_viewed(
    service: ProjectServiceDep,
    current_user: CurrentUserDep,
    db: DatabaseDep,
):
    """Son değişiklikler tablosunun görüntülendiğini işaretler."""
    await service.mark_changes_viewed(current_user)
    await db.commit()

@router.get("/{project_id}", response_model=ProjectResponse)
async def read_project_by_id(
    project_id: int,
    service: ProjectServiceDep,
    current_user_id: CurrentUserDep,
):
    """ID numarası verilen tek bir projenin detaylarını getirir."""
    return await service.get_project_by_id(project_id)

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_existing_project(
    project_id: int,
    data: ProjectUpdate,
    service: ProjectServiceDep,
    current_user: CurrentUserDep,
):
    """Mevcut bir projeyi günceller."""
    return await service.update_project(
        project_id,
        data,
        user_id=current_user.id,
        user_role=current_user.role,
    )

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_project(
    project_id: int,
    service: ProjectServiceDep,
    current_user: CurrentUserDep,
):
    """Bir projeyi sistemden tamamen siler."""
    await service.delete_project(project_id, user_role=current_user.role)
    return None
