import { createAppointment, updateAppointment } from './appointmentApi';

function trimValue(value) {
    return String(value ?? '').trim();
}

function toLocalDateTime(date, time) {
    if (!date || !time) return null;
    return `${date}T${time}:00`;
}

function buildAppointmentPayload(formData) {
    const title = trimValue(formData.get('title'));
    const appointmentDate = trimValue(formData.get('appointment_date'));
    const appointmentTime = trimValue(formData.get('appointment_time'));
    const startTime = toLocalDateTime(appointmentDate, appointmentTime);

    const payload = {
        title,
        start_time: startTime,
    };

    const description = trimValue(formData.get('description'));
    if (description) payload.description = description;

    const clientName = trimValue(formData.get('client_name'));
    if (clientName) payload.client_name = clientName;

    return { title, startTime, payload };
}

function validateAppointmentFields({ title, startTime }) {
    if (!title) return 'Randevu başlığı zorunludur.';
    if (!startTime) return 'Tarih ve saat zorunludur.';
    return null;
}

export async function createAppointmentAction(_prevState, formData) {
    const fields = buildAppointmentPayload(formData);
    const validationError = validateAppointmentFields(fields);

    if (validationError) {
        return { error: validationError, success: false };
    }

    try {
        await createAppointment(fields.payload);
        return { success: true, error: null };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}

export async function updateAppointmentAction(_prevState, formData) {
    const appointmentId = formData.get('appointmentId');
    const fields = buildAppointmentPayload(formData);
    const validationError = validateAppointmentFields(fields);

    if (validationError) {
        return { error: validationError, success: false };
    }

    try {
        await updateAppointment(appointmentId, fields.payload);
        return { success: true, error: null, isEdit: true };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}
