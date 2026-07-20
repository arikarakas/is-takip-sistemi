const MONTH_NAMES_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const WEEKDAY_NAMES_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export function formatMonthYearTR(year, month) {
    return `${MONTH_NAMES_TR[month]} ${year}`;
}

export function getWeekdayNamesTR() {
    return WEEKDAY_NAMES_TR;
}

export function toDateKey(date) {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDateKey(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export function formatTimeTR(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDateLongTR(dateKey) {
    const date = parseDateKey(dateKey);
    const day = date.getDate();
    const month = MONTH_NAMES_TR[date.getMonth()];
    const year = date.getFullYear();
    const weekday = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][date.getDay()];
    return `${day} ${month} ${year}, ${weekday}`;
}

export function getDefaultTimeForDate(dateKey) {
    const todayKey = toDateKey(new Date());
    if (dateKey === todayKey) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30 - (now.getMinutes() % 15));
        return formatTimeTR(now);
    }
    return '09:00';
}

export function groupAppointmentsByDate(appointments) {
    const map = new Map();

    for (const appointment of appointments) {
        const key = toDateKey(appointment.start_time);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(appointment);
    }

    for (const items of map.values()) {
        items.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    }

    return map;
}

export function buildMonthGrid(year, month) {
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - startOffset);

    const cells = [];
    for (let i = 0; i < 42; i += 1) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + i);
        cells.push({
            date,
            dateKey: toDateKey(date),
            day: date.getDate(),
            inCurrentMonth: date.getMonth() === month,
            isToday: toDateKey(date) === toDateKey(new Date()),
        });
    }

    return cells;
}

export function splitStartTime(startTime) {
    if (!startTime) return { date: '', time: '' };
    const date = new Date(startTime);
    if (Number.isNaN(date.getTime())) return { date: '', time: '' };
    const pad = (n) => String(n).padStart(2, '0');
    return {
        date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    };
}
