import {
    createMaintenanceContract,
    updateMaintenanceContract,
    upsertMonthlyInvoice,
} from './maintenanceContractApi';
import { parseCurrencyInput } from '../../constants/maintenanceContracts';

function trimValue(value) {
    return String(value ?? '').trim();
}

function toOptionalNumber(value) {
    return parseCurrencyInput(value);
}

function toRequiredNumber(value, fallback = 0) {
    const num = toOptionalNumber(value);
    return num === null ? fallback : num;
}

function buildContractPayload(formData) {
    const companyName = trimValue(formData.get('company_name'));
    const maintenanceCount = toRequiredNumber(formData.get('maintenance_count'), 1);

    const payload = {
        company_name: companyName,
        maintenance_count: Math.max(1, Math.trunc(maintenanceCount)),
        total_amount: toRequiredNumber(formData.get('total_amount'), 0),
        period_amount: toRequiredNumber(formData.get('period_amount'), 0),
    };

    const periodType = trimValue(formData.get('period_type'));
    if (periodType) payload.period_type = periodType;

    const paymentTerm = trimValue(formData.get('payment_term'));
    if (paymentTerm) payload.payment_term = paymentTerm;

    const startDate = trimValue(formData.get('start_date'));
    if (startDate) payload.start_date = startDate;

    const endDate = trimValue(formData.get('end_date'));
    if (endDate) payload.end_date = endDate;

    return { companyName, payload };
}

function validateContractFields({ companyName }) {
    if (!companyName) return 'Firma adı zorunludur.';
    return null;
}

export async function createMaintenanceContractAction(_prevState, formData) {
    const fields = buildContractPayload(formData);
    const validationError = validateContractFields(fields);

    if (validationError) {
        return { error: validationError, success: false };
    }

    try {
        await createMaintenanceContract(fields.payload);
        return { success: true, error: null };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}

export async function updateMaintenanceContractAction(_prevState, formData) {
    const contractId = formData.get('contractId');
    const fields = buildContractPayload(formData);
    const validationError = validateContractFields(fields);

    if (validationError) {
        return { error: validationError, success: false };
    }

    try {
        await updateMaintenanceContract(contractId, fields.payload);
        return { success: true, error: null, isEdit: true };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}

export async function upsertInvoiceAction(_prevState, formData) {
    const contractId = formData.get('contractId');
    const year = Number(formData.get('year'));
    const month = Number(formData.get('month'));
    const status = trimValue(formData.get('status')) || 'completed';
    const notes = trimValue(formData.get('notes'));
    const amountRaw = trimValue(formData.get('amount'));
    const periodAmountRaw = trimValue(formData.get('period_amount'));

    if (!contractId || !year || !month) {
        return { error: 'Eksik fatura bilgisi.', success: false };
    }

    let amount = null;
    if (amountRaw) {
        amount = toOptionalNumber(amountRaw);
        if (amount === null) {
            return { error: 'Geçerli bir tutar giriniz.', success: false };
        }
    } else if (status === 'completed') {
        amount = toOptionalNumber(periodAmountRaw);
    }

    try {
        await upsertMonthlyInvoice(contractId, {
            year,
            month,
            amount,
            status,
            notes: notes || null,
        });
        return { success: true, error: null };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}

export async function clearInvoiceAction(contractId, year, month) {
    try {
        await upsertMonthlyInvoice(contractId, {
            year,
            month,
            amount: null,
            status: 'empty',
            notes: null,
        });
        return { success: true, error: null };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}
