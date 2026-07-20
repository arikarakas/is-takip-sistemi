import { API_ROOT, apiFetch, getAuthHeaders, parseApiError } from '../../utils/api';

const API_BASE = `${API_ROOT}/appointments`;

async function parseAppointmentListResponse(response, fallbackError) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errorData.detail, fallbackError));
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.items || []);
}

export async function fetchAppointments({ skip = 0, limit = 500 } = {}) {
    const response = await apiFetch(`${API_BASE}/?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
    });

    return parseAppointmentListResponse(response, 'Yetkisiz veya Geçersiz İstek');
}

export async function createAppointment(payload) {
    const response = await apiFetch(`${API_BASE}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Randevu eklenirken bir hata oluştu.'));
    }

    return response.json();
}

export async function updateAppointment(appointId, payload) {
    const response = await apiFetch(`${API_BASE}/${appointId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Randevu bilgisi güncellenirken bir hata oluştu.'));
    }

    return response.json();
}

export async function deleteAppointment(appointId) {
    const response = await apiFetch(`${API_BASE}/${appointId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Randevu silinirken bir hata oluştu.'));
    }
}