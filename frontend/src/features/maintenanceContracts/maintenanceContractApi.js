import { API_ROOT, apiFetch, getAuthHeaders, parseApiError } from '../../utils/api';

const API_BASE = `${API_ROOT}/maintenance-contracts`;

async function parseListResponse(response, fallbackError) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errorData.detail, fallbackError));
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.items || []);
}

export async function fetchMaintenanceContracts(year) {
    const response = await apiFetch(`${API_BASE}/?year=${encodeURIComponent(year)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
    });

    return parseListResponse(response, 'Bakım anlaşmaları yüklenirken bir hata oluştu.');
}

export async function createMaintenanceContract(payload) {
    const response = await apiFetch(`${API_BASE}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Sözleşme eklenirken bir hata oluştu.'));
    }

    return response.json();
}

export async function updateMaintenanceContract(contractId, payload) {
    const response = await apiFetch(`${API_BASE}/${contractId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Sözleşme güncellenirken bir hata oluştu.'));
    }

    return response.json();
}

export async function deleteMaintenanceContract(contractId) {
    const response = await apiFetch(`${API_BASE}/${contractId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Sözleşme silinirken bir hata oluştu.'));
    }
}

export async function upsertMonthlyInvoice(contractId, payload) {
    const response = await apiFetch(`${API_BASE}/${contractId}/invoices`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Fatura kaydı kaydedilirken bir hata oluştu.'));
    }

    return response.json();
}
