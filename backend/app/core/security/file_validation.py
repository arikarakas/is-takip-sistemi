from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_EXTENSIONS = (".xlsx", ".xls", ".csv")

_MAGIC_SIGNATURES: dict[str, tuple[bytes, ...]] = {
    ".xlsx": (b"PK\x03\x04", b"PK\x05\x06"),
    ".xls": (b"\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"),
}


def _extension_from_filename(filename: str) -> str | None:
    lower_name = filename.lower()
    for ext in ALLOWED_EXTENSIONS:
        if lower_name.endswith(ext):
            return ext
    return None


def _validate_magic_bytes(extension: str, content: bytes) -> None:
    if extension == ".csv":
        if b"\x00" in content[:8192]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV dosyası geçersiz (ikili içerik tespit edildi).",
            )
        return

    signatures = _MAGIC_SIGNATURES.get(extension, ())
    if not any(content.startswith(signature) for signature in signatures):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dosya içeriği uzantısıyla uyuşmuyor.",
        )


async def read_import_file(file: UploadFile) -> tuple[bytes, str]:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dosya adı bulunamadı.",
        )

    extension = _extension_from_filename(file.filename)
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Desteklenen formatlar: .xlsx, .xls, .csv",
        )

    chunks: list[bytes] = []
    total_size = 0
    chunk_size = 1024 * 1024
    max_size = settings.IMPORT_MAX_FILE_SIZE_BYTES

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Dosya boyutu {settings.IMPORT_MAX_FILE_SIZE_MB} MB sınırını aşıyor.",
            )
        chunks.append(chunk)

    content = b"".join(chunks)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dosya boş.",
        )

    _validate_magic_bytes(extension, content)
    return content, file.filename
