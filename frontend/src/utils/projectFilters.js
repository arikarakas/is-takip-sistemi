export const TIME_FILTER_MODES = [
    { step: 1, shortLabel: 'Geciken', label: 'Geciken İşler', emoji: '⚠️' },
    { step: 2, shortLabel: 'Bugün', label: 'Bugünün İşleri', emoji: '📅' },
    { step: 3, shortLabel: '3 Gün', label: 'Önümüzdeki 3 Gün', emoji: '⏰' },
    { step: 4, shortLabel: '1 Hafta', label: 'Önümüzdeki 1 Hafta', emoji: '⏳' },
];

export function getPriorityFilterOptions(projects) {
    const levels = [...new Set(
        projects
            .map((project) => project.oncelik)
            .filter((value) => value != null && value !== '')
            .map(Number)
            .filter((level) => !Number.isNaN(level)),
    )].sort((a, b) => a - b);

    return [
        { value: 'TÜMÜ', label: 'Tüm Öncelikler' },
        ...levels.map((level) => ({
            value: `P${level}`,
            label: `P${level}`,
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

export function matchesPriorityFilter(oncelik, filter) {
    if (filter === 'TÜMÜ') return true;
    if (oncelik == null) return false;

    const level = Number(filter.replace('P', ''));
    return Number(oncelik) === level;
}

export function hasAdvancedFiltersActive(isTimeFilterActive, priorityFilter) {
    return isTimeFilterActive || priorityFilter !== 'TÜMÜ';
}
