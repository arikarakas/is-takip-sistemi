from fastapi import APIRouter, status, Query, UploadFile, File, HTTPException
from app.api.deps import ProjectServiceDep, CurrentUserDep
from app.models.project import ProjectStatus
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate, ProjectImportResponse
from app.services.project_import import ImportParseError, parse_import_file

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

@router.post("/import", response_model=ProjectImportResponse, status_code=status.HTTP_200_OK)
async def import_projects_from_file(
    service: ProjectServiceDep,
    current_user_id: CurrentUserDep,
    file: UploadFile = File(...),
    header_row: int | None = Query(
        None,
        ge=1,
        le=100,
        description="Başlık satırı (1 tabanlı). Boş bırakılırsa dosyada otomatik aranır.",
    ),
):
    """Excel veya CSV dosyasından projeleri içe aktarır."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dosya adı bulunamadı.")

    lower_name = file.filename.lower()
    if not lower_name.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Desteklenen formatlar: .xlsx, .xls, .csv",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dosya boş.")

    try:
        rows, detected_header_row, errors = parse_import_file(
            file_bytes,
            file.filename,
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
    return await service.update_project(project_id, data, user_id=current_user.id)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_project(
    project_id: int,
    service: ProjectServiceDep,
    current_user_id: CurrentUserDep,
):
    """Bir projeyi sistemden tamamen siler."""
    await service.delete_project(project_id)
    return None