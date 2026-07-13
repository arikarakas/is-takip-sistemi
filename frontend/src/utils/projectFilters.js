export const TIME_FILTER_MODES = [
    { step: 1, shortLabel: 'Geciken', label: 'Geciken İşler', emoji: '⚠️' },
    { step: 2, shortLabel: 'Bugün', label: 'Bugünün İşleri', emoji: '📅' },
    { step: 3, shortLabel: '3 Gün', label: 'Önümüzdeki 3 Gün', emoji: '⏰' },
    { step: 4, shortLabel: '1 Hafta', label: 'Önümüzdeki 1 Hafta', emoji: '⏳' },
];

export function getUrgencyFilterOptions(projects) {
    const levels = [
        ...new Set(
            projects
                .map((project) => project.aciliyet)
                .filter((value) => value != null && value !== '')
        ),
    ];

    return [
        { value: 'TÜMÜ', label: 'Tüm Aciliyetler' },
        ...levels.map((level) => ({
            value: level,
            label: level,
        })),
    ];
}

function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

export function parseProjectDate(value) {
    if (!value) return null;

    const [year, month, day] = String(value).split('T')[0].split('-').map(Number);
    if (!year || !month || !day) return null;

    return startOfDay(new Date(year, month - 1, day));
}

export function getDayDiffFromToday(targetDate) {
    const today = startOfDay(new Date());
    return Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
}

export function matchesTimeFilter(hedefTarih, step) {
    const targetDate = parseProjectDate(hedefTarih);
    if (!targetDate) return false;

    const diffDays = getDayDiffFromToday(targetDate);

    switch (step) {
        case 1:
            return diffDays < 0;
        case 2:
            return diffDays === 0;
        case 3:
            return diffDays >= 0 && diffDays <= 3;
        case 4:
            return diffDays >= 0 && diffDays <= 7;
        default:
            return true;
    }
}

export function matchesUrgencyFilter(aciliyet, filter) {
    if (filter === 'TÜMÜ') return true;
    if (!aciliyet) return false;

    // filter and aciliyet values are typically strings like 'Çok Acil', 'Acil', 'Normal' etc.
    // Case-insensitive and whitespace-insensitive comparison
    const normalize = str => String(str).toLocaleLowerCase('tr-TR').replace(/\s+/g, '');
    return normalize(aciliyet) === normalize(filter);
}

export function hasAdvancedFiltersActive(isTimeFilterActive, urgencyFilter) {
    return isTimeFilterActive || urgencyFilter !== 'TÜMÜ';
}
