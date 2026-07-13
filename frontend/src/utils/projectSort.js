import { ACILIYET_DEGERI } from '../constants/projects';

export function sortProjects(list, sortKey, sortDirection) {
    return [...list].sort((a, b) => {
        if (!sortKey) return 0;

        let valA = a[sortKey];
        let valB = b[sortKey];

        if (valA == null || valA === '') return 1;
        if (valB == null || valB === '') return -1;

        let result = 0;

        if (sortKey === 'aciliyet') {
            const dA = ACILIYET_DEGERI[valA] ?? 0;
            const dB = ACILIYET_DEGERI[valB] ?? 0;
            result = sortDirection === 'asc' ? dA - dB : dB - dA;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
            result = sortDirection === 'asc'
                ? valA.localeCompare(valB, 'tr')
                : valB.localeCompare(valA, 'tr');
        } else if (valA > valB) {
            result = sortDirection === 'asc' ? 1 : -1;
        } else if (valA < valB) {
            result = sortDirection === 'asc' ? -1 : 1;
        }

        if (result !== 0) return result;
        if (sortKey === 'aciliyet') return 0;

        const siraA = a.sira ?? Infinity;
        const siraB = b.sira ?? Infinity;
        return siraA - siraB;
    });
}
