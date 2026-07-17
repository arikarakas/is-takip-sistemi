import { createMachine, updateMachine } from './machineApi';

function trimValue(value) {
    return String(value ?? '').trim();
}

function buildMachinePayload(formData) {
    const ocak = trimValue(formData.get('ocak'));

    const payload = {
        ocak,
        bakim: formData.get('bakim') === 'true',
    };

    for (const field of ['tip', 'marka', 'manuel_kod']) {
        const value = trimValue(formData.get(field));
        if (value) payload[field] = value;
    }

    const halatBoyu = trimValue(formData.get('rope_length'));
    if (halatBoyu && !/^\d{4}-\d{2}-\d{2}$/.test(halatBoyu)) {
        payload.halat_boyu = halatBoyu;
    }

    for (const field of ['bakim_tarih', 'halat_degisim_tarih']) {
        const value = trimValue(formData.get(field));
        if (value) payload[field] = value;
    }

    return { ocak, payload };
}

function validateMachineFields({ ocak }) {
    if (!ocak) return 'Bina adı zorunludur.';
    return null;
}

export async function createMachineAction(_prevState, formData) {
    const fields = buildMachinePayload(formData);
    const validationError = validateMachineFields(fields);

    if (validationError) {
        return { error: validationError, success: false };
    }

    try {
        await createMachine(fields.payload);
        return { success: true, error: null };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}

export async function updateMachineAction(_prevState, formData) {
    const machineId = formData.get('machineId');
    const fields = buildMachinePayload(formData);
    const validationError = validateMachineFields(fields);

    if (validationError) {
        return { error: validationError, success: false };
    }

    try {
        await updateMachine(machineId, fields.payload);
        return { success: true, error: null, isEdit: true };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}
