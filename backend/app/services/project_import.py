import io
import re
from datetime import date, datetime
from typing import Any

import pandas as pd
from pydantic import ValidationError

from app.models.project import ProjectStatus
from app.schemas.project import ProjectImportRow

EXPECTED_COLUMN_ORDER = [
    "sira",
    "oncelik",
    "aciliyet",
    "title",
    "client",
    "aksiyon",
    "sorumlular",
    "ilgili",
    "hedef_tarih",
    "durum",
    "beklenen",
    "notlar",
    "risk",
    "guncel_sira",
    "tamamlanma",
]

FIELD_ALIASES: dict[str, list[str]] = {
    "sira": ["sıra", "sira"],
    "oncelik": ["öncelik", "oncelik"],
    "aciliyet": ["aciliyet"],
    "title": ["başlık", "baslik", "konu", "iş/konu", "is/konu"],
    "client": ["müşteri", "musteri", "proje / müşteri", "proje/müşteri"],
    "aksiyon": ["aksiyon", "sonraki adım", "sonraki adim"],
    "sorumlular": ["sorumlu", "sorumlular"],
    "ilgili": ["ilgili"],
    "hedef_tarih": ["hedef tarih", "tarih"],
    "durum": ["durum"],
    "beklenen": ["beklenen"],
    "notlar": ["notlar", "not"],
    "risk": ["risk", "bağımlılık", "bagimlilik"],
    "guncel_sira": ["güncel sıra", "guncel sira"],
    "tamamlanma": ["tamamlanma"],
}

SKIP_COLUMN_KEYWORDS = [
    "son güncelleme",
    "son guncelleme",
    "toplantıda",
    "toplantida",
    "karar / aksiyon",
    "karar aksiyon",
]

HEADER_KEYWORDS = [
    "sıra",
    "sira",
    "öncelik",
    "oncelik",
    "aciliyet",
    "başlık",
    "baslik",
    "müşteri",
    "musteri",
    "aksiyon",
    "sorumlu",
    "durum",
    "tamamlanma",
]

DURUM_MAP: dict[str, ProjectStatus] = {
    "beklemede": ProjectStatus.BEKLEMEDE,
    "açık": ProjectStatus.AÇIK,
    "acik": ProjectStatus.AÇIK,
    "devam ediyor": ProjectStatus.DEVAM_EDİYOR,
    "devam edıyor": ProjectStatus.DEVAM_EDİYOR,
    "tamamlandı": ProjectStatus.TAMAMLANDI,
    "tamamlandi": ProjectStatus.TAMAMLANDI,
}

MAX_SCAN_ROWS = 30
MIN_HEADER_SCORE = 3

TR_CHAR_MAP = str.maketrans("ğıüşöçİĞÜŞÖÇ", "giusocigusoc")


class ImportParseError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


def normalize_text(value: Any) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return str(value).strip()


def normalize_key(value: Any) -> str:
    text = normalize_text(value).lower().translate(TR_CHAR_MAP)
    return re.sub(r"\s+", " ", text)


def is_empty_cell(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, float) and pd.isna(value):
        return True
    return normalize_text(value) == ""


def is_skip_column(header: Any) -> bool:
    norm = normalize_key(header)
    return any(keyword in norm for keyword in SKIP_COLUMN_KEYWORDS)


def score_header_row(row_values: list[Any]) -> int:
    score = 0
    for cell in row_values:
        norm = normalize_key(cell)
        if not norm:
            continue
        for keyword in HEADER_KEYWORDS:
            if keyword in norm:
                score += 1
                break
    return score


def detect_header_row(raw_df: pd.DataFrame) -> int:
    best_row = 0
    best_score = 0
    scan_limit = min(MAX_SCAN_ROWS, len(raw_df))

    for row_idx in range(scan_limit):
        row_values = raw_df.iloc[row_idx].tolist()
        score = score_header_row(row_values)
        if score > best_score:
            best_score = score
            best_row = row_idx

    if best_score < MIN_HEADER_SCORE:
        raise ImportParseError(
            "Başlık satırı otomatik bulunamadı. "
            "Dosyanın üst kısmında 'Sıra', 'Öncelik', 'Durum' gibi kolon başlıkları olmalı "
            "veya başlık satır numarasını elle girin."
        )
    return best_row


def read_raw_dataframe(file_bytes: bytes, filename: str) -> pd.DataFrame:
    buffer = io.BytesIO(file_bytes)
    lower_name = filename.lower()

    if lower_name.endswith(".csv"):
        for encoding in ("utf-8-sig", "utf-8", "cp1254", "latin-1"):
            try:
                buffer.seek(0)
                return pd.read_csv(buffer, sep=";", header=None, dtype=object, encoding=encoding)
            except UnicodeDecodeError:
                continue
        raise ImportParseError("CSV dosyası okunamadı. Dosya kodlamasını kontrol edin.")

    if lower_name.endswith((".xlsx", ".xls")):
        buffer.seek(0)
        return pd.read_excel(buffer, header=None, dtype=object)

    raise ImportParseError("Desteklenen formatlar: .xlsx, .xls, .csv")


def build_dataframe(file_bytes: bytes, filename: str, header_row: int | None) -> tuple[pd.DataFrame, int]:
    raw_df = read_raw_dataframe(file_bytes, filename)
    if raw_df.empty:
        raise ImportParseError("Dosya boş görünüyor.")

    if header_row is not None:
        header_index = header_row - 1
        if header_index < 0 or header_index >= len(raw_df):
            raise ImportParseError(f"Başlık satırı ({header_row}) dosya kapsamı dışında.")
    else:
        header_index = detect_header_row(raw_df)

    headers = [normalize_text(value) for value in raw_df.iloc[header_index].tolist()]
    data_df = raw_df.iloc[header_index + 1 :].copy()
    data_df.columns = headers
    data_df = data_df.dropna(how="all")
    data_df = data_df.loc[
        ~data_df.apply(
            lambda row: all(is_empty_cell(value) for value in row),
            axis=1,
        )
    ]

    return data_df, header_index + 1


def match_field_for_header(header: str) -> str | None:
    norm = normalize_key(header)
    if not norm or is_skip_column(header):
        return None

    for field, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            alias_norm = normalize_key(alias)
            if alias_norm in norm or norm in alias_norm:
                return field
    return None


def build_column_map(headers: list[str]) -> dict[str, str]:
    column_map: dict[str, str] = {}
    used_headers: set[str] = set()

    for header in headers:
        field = match_field_for_header(header)
        if field and field not in column_map:
            column_map[field] = header
            used_headers.add(header)

    usable_headers = [header for header in headers if header and not is_skip_column(header)]
    for field, header in zip(EXPECTED_COLUMN_ORDER, usable_headers):
        if field not in column_map:
            column_map[field] = header

    return column_map


def parse_oncelik(value: Any) -> int | None:
    if is_empty_cell(value):
        return None
    text = normalize_text(value).upper()
    if text.startswith("P") and text[1:].isdigit():
        return int(text[1:])
    if text.isdigit():
        return int(text)
    return None


def parse_tamamlanma(value: Any) -> int:
    if is_empty_cell(value):
        return 0
    text = normalize_text(value).replace("%", "").replace(",", ".")
    try:
        number = int(float(text))
    except ValueError:
        return 0
    return max(0, min(100, number))


def parse_durum(value: Any) -> ProjectStatus:
    if is_empty_cell(value):
        return ProjectStatus.BEKLEMEDE
    norm = normalize_key(value)
    return DURUM_MAP.get(norm, ProjectStatus.BEKLEMEDE)


def parse_date(value: Any) -> date | None:
    if is_empty_cell(value):
        return None

    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value

    text = normalize_text(value)
    for fmt in ("%d.%m.%Y", "%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def parse_int(value: Any) -> int | None:
    if is_empty_cell(value):
        return None
    text = normalize_text(value)
    if text.isdigit():
        return int(text)
    try:
        return int(float(text.replace(",", ".")))
    except ValueError:
        return None


def row_is_empty(row: pd.Series, column_map: dict[str, str]) -> bool:
    title = normalize_text(row.get(column_map.get("title", ""), ""))
    client = normalize_text(row.get(column_map.get("client", ""), ""))
    aksiyon = normalize_text(row.get(column_map.get("aksiyon", ""), ""))
    return not title and not client and not aksiyon


def parse_project_row(row: pd.Series, column_map: dict[str, str]) -> dict[str, Any]:
    def cell(field: str) -> Any:
        header = column_map.get(field)
        if not header:
            return None
        return row.get(header)

    durum = parse_durum(cell("durum"))
    tamamlanma = parse_tamamlanma(cell("tamamlanma"))

    data: dict[str, Any] = {
        "title": normalize_text(cell("title")),
        "client": normalize_text(cell("client")),
        "aksiyon": normalize_text(cell("aksiyon")),
        "sorumlular": normalize_text(cell("sorumlular")),
        "durum": durum,
        "tamamlanma": tamamlanma,
    }

    oncelik = parse_oncelik(cell("oncelik"))
    if oncelik is not None:
        data["oncelik"] = oncelik

    sira = parse_int(cell("sira"))
    guncel_sira = parse_int(cell("guncel_sira"))
    if sira is not None:
        data["sira"] = sira
    if guncel_sira is not None:
        data["guncel_sira"] = guncel_sira

    for field in ("aciliyet", "ilgili", "beklenen", "notlar", "risk"):
        value = normalize_text(cell(field))
        if value:
            data[field] = value

    hedef_tarih = parse_date(cell("hedef_tarih"))
    if hedef_tarih:
        data["hedef_tarih"] = hedef_tarih

    return data


def parse_import_file(
    file_bytes: bytes,
    filename: str,
    header_row: int | None = None,
) -> tuple[list[ProjectImportRow], int, list[tuple[int, str]]]:
    data_df, detected_header_row = build_dataframe(file_bytes, filename, header_row)
    if data_df.empty:
        raise ImportParseError("Başlık satırından sonra içe aktarılacak veri bulunamadı.")

    column_map = build_column_map(list(data_df.columns))
    missing_required = [
        field
        for field in ("title", "client", "aksiyon", "sorumlular")
        if field not in column_map or not column_map[field]
    ]
    if missing_required:
        raise ImportParseError(
            "Zorunlu kolonlar eşleştirilemedi. Başlık satırını kontrol edin "
            f"veya başlık satır numarasını elle belirtin. Eksik: {', '.join(missing_required)}"
        )

    parsed_rows: list[ProjectImportRow] = []
    errors: list[tuple[int, str]] = []

    for offset, (_, row) in enumerate(data_df.iterrows()):
        excel_row = detected_header_row + offset + 1
        if row_is_empty(row, column_map):
            continue

        try:
            raw_data = parse_project_row(row, column_map)
            if not raw_data["title"]:
                raise ValueError("Proje başlığı boş olamaz.")
            if not raw_data["client"]:
                raise ValueError("Müşteri adı boş olamaz.")
            if not raw_data["aksiyon"]:
                raise ValueError("Aksiyon / sonraki adım boş olamaz.")
            if not raw_data["sorumlular"]:
                raise ValueError("Sorumlu kişi(ler) boş olamaz.")

            parsed_rows.append(ProjectImportRow(**raw_data))
        except (ValueError, ValidationError) as exc:
            message = str(exc)
            if isinstance(exc, ValidationError):
                message = "; ".join(error["msg"] for error in exc.errors())
            errors.append((excel_row, message))

    if not parsed_rows and errors:
        raise ImportParseError("Hiçbir satır içe aktarılamadı. İlk hatalar: " + errors[0][1])

    return parsed_rows, detected_header_row, errors
