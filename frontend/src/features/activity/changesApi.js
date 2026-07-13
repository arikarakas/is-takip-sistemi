import { API_ROOT, apiFetch, getAuthHeaders, parseApiError } from '../../utils/api';

export async function fetchRecentChanges(limit = 30) {
    const response = await apiFetch(`${API_ROOT}/projects/changes/recent?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errorData.detail, 'Değişiklikler yüklenemedi.'));
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function markChangesViewed() {
    await apiFetch(`${API_ROOT}/projects/changes/mark-viewed`, {
        method: 'PATCH',
        headers: getAuthHeaders(null),
        cache: 'no-store',
    });
}

export async function fetchUnreadChangesCount() {
    const response = await apiFetch(`${API_ROOT}/projects/changes/unread-count`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.count ?? 0;
}
