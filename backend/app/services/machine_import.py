import io
import re
from datetime import date, datetime
from typing import Any

import pandas as pd
from pydantic import ValidationError

from app.schemas.machine import MachineImportRow

EXPECTED_COLUMN_ORDER = [
    "ocak",
    "halat_degisim_tarih",
    "halat_boyu",
    "tip",
    "bakim",
    "marka",
    "manuel_kod",
]

FIELD_ALIASES: dict[str, list[str]] = {
    "ocak": ["ocak"],
    "halat_degisim_tarih": [
        "son halat degisim tarihi",
        "halat degisim tarihi",
        "halat degisim",
    ],
    "halat_boyu": ["halat boyu"],
    "tip": ["makina tipi", "makine tipi", "tip"],
    "bakim": ["bakimi yapilan", "bakim yapilan", "bakim"],
    "marka": ["marka"],
    "manuel_kod": ["gind manuel kod", "manuel kod", "manuel kodu"],
}

HEADER_KEYWORDS = [
    "ocak",
    "halat",
    "makina",
    "makine",
    "bakim",
    "marka",
    "manuel",
]

TRUE_VALUES = {
    "1",
    "true",
    "evet",
    "e",
    "var",
    "x",
    "yapildi",
    "yapilmis",
    "tamam",
    "ok",
}

FALSE_VALUES = {
    "0",
    "false",
    "hayir",
    "h",
    "yok",
    "-",
}

MAX_SCAN_ROWS = 30
MIN_HEADER_SCORE = 2

TR_CHAR_MAP = str.maketrans("ğıüşöçİĞÜŞÖÇ", "giusocigusoc")


class ImportParseError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


def normalize_text(value: Any) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return str(value).strip()


def normalize_multiline(value: Any) -> str:
    text = normalize_text(value)
    if not text:
        return ""
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)


def normalize_key(value: Any) -> str:
    text = normalize_text(value).lower().translate(TR_CHAR_MAP)
    return re.sub(r"\s+", " ", text)


def is_empty_cell(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, float) and pd.isna(value):
        return True
    return normalize_text(value) == ""


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
            "Dosyanın üst kısmında 'OCAK', 'MAKİNA TİPİ', 'MARKA' gibi kolon başlıkları olmalı "
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
    if not norm:
        return None

    # Longer aliases first so "halat boyu" wins over generic "halat" fragments.
    candidates: list[tuple[int, str]] = []
    for field, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            alias_norm = normalize_key(alias)
            if alias_norm in norm or norm in alias_norm:
                candidates.append((len(alias_norm), field))

    if not candidates:
        return None

    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


def build_column_map(headers: list[str]) -> dict[str, str]:
    column_map: dict[str, str] = {}

    for header in headers:
        field = match_field_for_header(header)
        if field and field not in column_map:
            column_map[field] = header

    usable_headers = [header for header in headers if header]
    for field, header in zip(EXPECTED_COLUMN_ORDER, usable_headers):
        if field not in column_map:
            column_map[field] = header

    return column_map


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


def parse_bakim(value: Any) -> bool:
    if is_empty_cell(value):
        return False

    if isinstance(value, bool):
        return value

    norm = normalize_key(value)
    if norm in TRUE_VALUES:
        return True
    if norm in FALSE_VALUES:
        return False

    # Excel sometimes stores checkbox/fill as numeric 1/0 already as float string.
    try:
        return float(norm) != 0.0
    except ValueError:
        return False


def parse_optional_text(value: Any, *, multiline: bool = False) -> str | None:
    text = normalize_multiline(value) if multiline else normalize_text(value)
    if not text or text == "-":
        return None
    return text


def row_is_empty(row: pd.Series, column_map: dict[str, str]) -> bool:
    ocak = normalize_text(row.get(column_map.get("ocak", ""), ""))
    return not ocak


def parse_machine_row(row: pd.Series, column_map: dict[str, str]) -> dict[str, Any]:
    def cell(field: str) -> Any:
        header = column_map.get(field)
        if not header:
            return None
        return row.get(header)

    data: dict[str, Any] = {
        "ocak": normalize_text(cell("ocak")),
        "bakim": parse_bakim(cell("bakim")),
    }

    tip = parse_optional_text(cell("tip"), multiline=True)
    if tip:
        data["tip"] = tip

    for field in ("halat_boyu", "marka", "manuel_kod"):
        value = parse_optional_text(cell(field))
        if value:
            data[field] = value

    halat_degisim_tarih = parse_date(cell("halat_degisim_tarih"))
    if halat_degisim_tarih:
        data["halat_degisim_tarih"] = halat_degisim_tarih

    return data


def parse_import_file(
    file_bytes: bytes,
    filename: str,
    header_row: int | None = None,
) -> tuple[list[MachineImportRow], int, list[tuple[int, str]]]:
    data_df, detected_header_row = build_dataframe(file_bytes, filename, header_row)
    if data_df.empty:
        raise ImportParseError("Başlık satırından sonra içe aktarılacak veri bulunamadı.")

    column_map = build_column_map(list(data_df.columns))
    if "ocak" not in column_map or not column_map["ocak"]:
        raise ImportParseError(
            "Zorunlu kolon eşleştirilemedi. Başlık satırını kontrol edin "
            "veya başlık satır numarasını elle belirtin. Eksik: ocak"
        )

    parsed_rows: list[MachineImportRow] = []
    errors: list[tuple[int, str]] = []

    for offset, (_, row) in enumerate(data_df.iterrows()):
        excel_row = detected_header_row + offset + 1
        if row_is_empty(row, column_map):
            continue

        try:
            raw_data = parse_machine_row(row, column_map)
            if not raw_data["ocak"]:
                raise ValueError("Ocak adı boş olamaz.")
            parsed_rows.append(MachineImportRow(**raw_data))
        except (ValueError, ValidationError) as exc:
            message = str(exc)
            if isinstance(exc, ValidationError):
                message = "; ".join(error["msg"] for error in exc.errors())
            errors.append((excel_row, message))

    if not parsed_rows and errors:
        raise ImportParseError("Hiçbir satır içe aktarılamadı. İlk hatalar: " + errors[0][1])

    return parsed_rows, detected_header_row, errors
