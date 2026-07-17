import { API_ROOT, apiFetch, getAuthHeaders, parseApiError } from '../../utils/api';

const API_BASE = `${API_ROOT}/machines`;

async function parseMachineListResponse(response, fallbackError) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errorData.detail, fallbackError));
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.items || []);
}

export async function fetchMachines({ skip = 0, limit = 500 } = {}) {
    const response = await apiFetch(`${API_BASE}/?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
    });

    return parseMachineListResponse(response, 'Yetkisiz veya Geçersiz İstek');
}

export async function createMachine(payload) {
    const response = await apiFetch(`${API_BASE}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Makine eklenirken bir hata oluştu.'));
    }

    return response.json();
}

export async function updateMachine(machineId, payload) {
    const response = await apiFetch(`${API_BASE}/${machineId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Makine bilgisi güncellenirken bir hata oluştu.'));
    }

    return response.json();
}

export async function deleteMachine(machineId) {
    const response = await apiFetch(`${API_BASE}/${machineId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Makine silinirken bir hata oluştu.'));
    }
}

export async function importMachines(formData) {
    const file = formData.get('file');
    const headerRow = String(formData.get('header_row') ?? '').trim();

    const body = new FormData();
    body.append('file', file);

    let url = `${API_BASE}/import`;
    if (headerRow) {
        url += `?header_row=${encodeURIComponent(headerRow)}`;
    }

    const token = localStorage.getItem('token');
    const response = await apiFetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'İçe aktarma sırasında bir hata oluştu.'));
    }

    return response.json();
}