export const PROJECT_TABLE_COLUMNS = [
    { key: 'sira', label: 'SIRA', width: 84 },
    { key: 'aciliyet', label: 'ACİLİYET', width: 108 },
    { key: 'durum', label: 'DURUM', width: 164 },
    { key: 'title', label: 'PROJE ADI', width: 220 },
    { key: 'client', label: 'MÜŞTERİ ADI', width: 156 },
    { key: 'aksiyon', label: 'YAPILACAK İŞ', width: 400 },
    { key: 'talep', label: 'MÜŞTERİ TALEBİ', width: 400},
    { key: 'sorumlular', label: 'İŞTEN SORUMLU KİŞİ(LER)', width: 176 },
    { key: 'ilgili', label: 'MÜŞTERİ İLGİLİ KİŞİ(LER)', width: 176 },
    { key: 'hedef_tarih', label: 'HEDEF TARİH', width: 132 },
    { key: 'tamamlanma_tarih', label: 'TAMAMLANMA TARİHİ', width: 132},
    { key: 'beklenen', label: 'HEDEF', width: 200 },
    { key: 'notlar', label: 'NOTLAR', width: 400 },
    { key: 'last_modified_by', label: 'SON DEĞİŞİKLİK', width: 176},
];

export const PROJECT_TABLE_WIDTH = PROJECT_TABLE_COLUMNS.reduce((sum, col) => sum + col.width, 0);

export const STICKY_COLUMN_OFFSETS = { sira: 0, title: 84 };

export const STATUS_STYLES = {
    BEKLEMEDE: 'bg-slate-100 text-slate-600 border-slate-200',
    'DEVAM EDİYOR': 'bg-amber-50 text-amber-700 border-amber-200',
    TAMAMLANDI: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const STATUS_FILTER_ACTIVE_STYLES = {
    HEPSİ: 'bg-white text-blue-600 shadow-sm',
    BEKLEMEDE: 'text-white bg-slate-600 shadow-sm',
    'DEVAM EDİYOR': 'text-white bg-amber-700 shadow-sm',
    TAMAMLANDI: 'text-white bg-emerald-700 shadow-sm',
};

export const STATUS_FILTER_INACTIVE_STYLES = {
    HEPSİ: 'hover:bg-white/40',
    BEKLEMEDE: 'hover:text-slate-600 hover:bg-white/40',
    'DEVAM EDİYOR': 'hover:text-amber-700 hover:bg-white/40',
    TAMAMLANDI: 'hover:text-emerald-700 hover:bg-white/40',
};

export const PROJECT_STATUS_OPTIONS = [
    { value: 'BEKLEMEDE', label: 'Beklemede' },
    { value: 'DEVAM EDİYOR', label: 'Devam Ediyor' },
    { value: 'TAMAMLANDI', label: 'Tamamlandı' },
];

export const MACHINE_STATUS_OPTIONS = [
    { value: 'true', label: 'Evet' },
    { value: 'false', label: 'Hayır' },
];

export const ACILIYET_DEGERI = {
    'Çok Acil': 4,
    'Acil': 3,
    'Normal': 2,
    'Düşük': 1,
};

export const PROJECT_URGENCY_OPTIONS = [
    { value: 'Çok Acil', label: 'Çok Acil' },
    { value: 'Acil', label: 'Acil' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Düşük', label: 'Düşük' },
];

export const INPUT_CLASS_NAME = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white';
export const LABEL_CLASS_NAME = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5';
