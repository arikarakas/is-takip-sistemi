import { createProject, updateProject } from './projectApi';

function trimValue(value) {
    return String(value ?? '').trim();
}

function collectAssignees(formData) {
    const assignedUserIds = formData
        .getAll('assigned_user_ids')
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);
    const assignedCustomNames = formData
        .getAll('assigned_custom_names')
        .map((value) => trimValue(value))
        .filter(Boolean);
    const sorumlular = trimValue(formData.get('sorumlular'));
    return { assignedUserIds, assignedCustomNames, sorumlular };
}

function optionalText(formData, field) {
    const value = trimValue(formData.get(field));
    return value || null;
}

function buildProjectPayload(formData, { assignedUserIds, assignedCustomNames, sorumlular }) {
    const title = trimValue(formData.get('title'));
    const client = trimValue(formData.get('client'));
    const aksiyon = trimValue(formData.get('aksiyon'));

    const payload = {
        title,
        client,
        aksiyon: aksiyon || null,
        sorumlular,
        assigned_user_ids: assignedUserIds,
        assigned_custom_names: assignedCustomNames,
        durum: formData.get('durum') || 'BEKLEMEDE',
        tamamlanma: Number(trimValue(formData.get('tamamlanma')) || 0),
        talep: optionalText(formData, 'talep'),
        aciliyet: optionalText(formData, 'aciliyet'),
        ilgili: optionalText(formData, 'ilgili'),
        ilgili_email: optionalText(formData, 'ilgili_email'),
        ilgili_telefon: optionalText(formData, 'ilgili_telefon'),
        beklenen: optionalText(formData, 'beklenen'),
        notlar: optionalText(formData, 'notlar'),
        risk: optionalText(formData, 'risk'),
        hedef_tarih: optionalText(formData, 'hedef_tarih'),
    };

    const oncelik = trimValue(formData.get('oncelik'));
    if (oncelik) payload.oncelik = Number(oncelik);

    return { title, client, aksiyon, sorumlular, assignedUserIds, assignedCustomNames, payload };
}

function validateProjectFields({ title, client, aksiyon, sorumlular, assignedUserIds, assignedCustomNames }) {
    if (!title) return 'Proje başlığı zorunludur.';
    if (!client) return 'Müşteri adı zorunludur.';
    if (!sorumlular || (assignedUserIds.length === 0 && assignedCustomNames.length === 0)) {
        return 'En az bir sorumlu kişi seçin veya özel isim ekleyin.';
    }
    return null;
}

export async function createProjectAction(_prevState, formData) {
    const assignees = collectAssignees(formData);
    const fields = buildProjectPayload(formData, assignees);
    const validationError = validateProjectFields(fields);

    if (validationError) {
        return { error: validationError, success: false };
    }

    try {
        await createProject(fields.payload);
        return { success: true, error: null };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}

export async function updateProjectAction(_prevState, formData) {
    const projectId = formData.get('projectId');
    const assignees = collectAssignees(formData);
    const fields = buildProjectPayload(formData, assignees);
    const validationError = validateProjectFields(fields);

    if (validationError) {
        return { error: validationError, success: false };
    }

    try {
        await updateProject(projectId, fields.payload);
        return { success: true, error: null, isEdit: true };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}
