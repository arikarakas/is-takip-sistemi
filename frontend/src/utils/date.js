export function formatDateTR(value) {
    if (!value) return '';
    const [year, month, day] = String(value).split('T')[0].split('-');
    if (!year || !month || !day) return value;
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
}
