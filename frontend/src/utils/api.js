const DEFAULT_API_ROOT = '/api/v1';

export const API_ROOT = (import.meta.env.VITE_API_URL || DEFAULT_API_ROOT).replace(/\/$/, '');

export function getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    return headers;
}

export function parseApiError(detail, fallback) {
    if (Array.isArray(detail)) {
        return detail.map((item) => item.msg).join(', ');
    }
    if (typeof detail === 'string') {
        return detail;
    }
    return fallback;
}

export async function fetchCurrentUser() {
    const response = await fetch(`${API_ROOT}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errorData.detail, 'Oturum bilgisi alınamadı.'));
    }

    return response.json();
}
