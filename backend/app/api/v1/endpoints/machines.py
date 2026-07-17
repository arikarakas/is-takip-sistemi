from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from app.api.deps import (
    AdminUserDep,
    CurrentUserDep,
    ImportRateLimitDep,
    MachineServiceDep,
)
from app.core.security.file_validation import read_import_file
from app.schemas.machine import (
    MachineCreate,
    MachineImportResponse,
    MachineResponse,
    MachineUpdate,
)
from app.services.machine_import import ImportParseError, parse_import_file

router = APIRouter()


@router.post("/", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
async def create_new_machine(
    data: MachineCreate,
    service: MachineServiceDep,
    current_user: CurrentUserDep,
):
    """Sisteme yeni bir makine ekler."""
    return await service.create_machine(data, user_id=current_user.id)


@router.get("/", response_model=list[MachineResponse])
async def read_all_machines(
    service: MachineServiceDep,
    current_user: CurrentUserDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Tüm makineleri sıralı ve sayfalandırılmış olarak listeler."""
    return await service.get_all_machines(skip=skip, limit=limit)


@router.post("/import", response_model=MachineImportResponse, status_code=status.HTTP_200_OK)
async def import_machines_from_file(
    service: MachineServiceDep,
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
    """Excel veya CSV dosyasından makineleri içe aktarır. Yalnızca admin erişebilir."""
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

    return await service.import_machines(rows, detected_header_row, errors)


@router.get("/status/{machine_status}", response_model=list[MachineResponse])
async def read_machines_by_status(
    machine_status: bool,
    service: MachineServiceDep,
    current_user: CurrentUserDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Belirli bakım durumundaki makineleri filtreler."""
    return await service.get_machines_by_status(
        status=machine_status,
        skip=skip,
        limit=limit,
    )


@router.get("/{machine_id}", response_model=MachineResponse)
async def read_machine_by_id(
    machine_id: int,
    service: MachineServiceDep,
    current_user: CurrentUserDep,
):
    """ID numarası verilen tek bir makinenin detaylarını getirir."""
    return await service.get_machine_by_id(machine_id=machine_id)


@router.put("/{machine_id}", response_model=MachineResponse)
async def update_existing_machine(
    machine_id: int,
    data: MachineUpdate,
    service: MachineServiceDep,
    current_user: CurrentUserDep,
):
    """Mevcut bir makineyi günceller."""
    return await service.update_machine(
        machine_id=machine_id,
        data=data,
        user_id=current_user.id,
    )


@router.delete("/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_machine(
    machine_id: int,
    service: MachineServiceDep,
    current_user: CurrentUserDep,
):
    """Bir makineyi sistemden tamamen siler."""
    await service.delete_machine(machine_id=machine_id)
    return None
