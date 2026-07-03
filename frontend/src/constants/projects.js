export const PROJECT_TABLE_COLUMNS = [
    { key: 'sira', label: 'SIRA', width: 84 },
    { key: 'oncelik', label: 'ÖNCELİK', width: 108 },
    { key: 'aciliyet', label: 'ACİLİYET', width: 108 },
    { key: 'title', label: 'PROJE BAŞLIĞI', width: 220 },
    { key: 'client', label: 'PROJE / MÜŞTERİ', width: 156 },
    { key: 'aksiyon', label: 'AKSİYON / SONRAKİ ADIM', width: 400 },
    { key: 'sorumlular', label: 'İŞTEN SORUMLU KİŞİ(LER)', width: 176 },
    { key: 'ilgili', label: 'İLGİLİ KİŞİ', width: 132 },
    { key: 'hedef_tarih', label: 'HEDEF TARİH', width: 132 },
    { key: 'durum', label: 'DURUM', width: 164 },
    { key: 'beklenen', label: 'BEKLENEN ÇIKTI', width: 200 },
    { key: 'notlar', label: 'NOTLAR', width: 400 },
    { key: 'risk', label: 'RİSK / BAĞIMLILIK', width: 400 },
    { key: 'guncel_sira', label: 'GÜNCEL SIRA', width: 112 },
    { key: 'tamamlanma', label: 'TAMAMLANMA', width: 186 },
];

export const PROJECT_TABLE_WIDTH = PROJECT_TABLE_COLUMNS.reduce((sum, col) => sum + col.width, 0);

export const STICKY_COLUMN_OFFSETS = { sira: 0, title: 84 };

export const STATUS_STYLES = {
    BEKLEMEDE: 'bg-slate-100 text-slate-600 border-slate-200',
    'AÇIK': 'bg-sky-50 text-sky-700 border-sky-200',
    'DEVAM EDİYOR': 'bg-amber-50 text-amber-700 border-amber-200',
    TAMAMLANDI: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const PROJECT_STATUS_OPTIONS = [
    { value: 'BEKLEMEDE', label: 'Beklemede' },
    { value: 'AÇIK', label: 'Açık' },
    { value: 'DEVAM EDİYOR', label: 'Devam Ediyor' },
    { value: 'TAMAMLANDI', label: 'Tamamlandı' },
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
