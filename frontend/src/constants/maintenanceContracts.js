export const MONTH_LABELS = [
    { month: 1, label: 'OCAK' },
    { month: 2, label: 'ŞUBAT' },
    { month: 3, label: 'MART' },
    { month: 4, label: 'NİSAN' },
    { month: 5, label: 'MAYIS' },
    { month: 6, label: 'HAZİRAN' },
    { month: 7, label: 'TEMMUZ' },
    { month: 8, label: 'AĞUSTOS' },
    { month: 9, label: 'EYLÜL' },
    { month: 10, label: 'EKİM' },
    { month: 11, label: 'KASIM' },
    { month: 12, label: 'ARALIK' },
];

export const INVOICE_STATUS_OPTIONS = [
    { value: 'completed', label: 'TAMAMLANDI — Fatura Kesildi / Bakım Yapıldı' },
    { value: 'planned', label: 'PLANLANDI' },
    { value: 'postponed', label: 'ERTELENDİ' },
    { value: 'failed', label: 'İPTAL / BAŞARISIZ' },
    { value: 'empty', label: 'BOŞ' },
];

export const CONTRACT_FIXED_COLUMNS = [
    { key: 'company_name', label: 'BAKIM ANLAŞMALI FİRMALARI', width: 220 },
    { key: 'sira', label: 'SIRA NO', width: 72 },
    { key: 'maintenance_count', label: 'BAKIM ADEDİ', width: 96 },
    { key: 'period_type', label: 'BAKIM DÖNEMİ', width: 110 },
    { key: 'start_date', label: 'BAKIM BAŞLAMA TARİHİ', width: 130 },
    { key: 'end_date', label: 'BAKIM BİTİŞ TARİHİ', width: 120 },
    { key: 'total_amount', label: 'SÖZLEŞME BEDELİ TL', width: 170 },
    { key: 'payment_term', label: 'DÖNEM VADELERİ (Sayı)', width: 120 },
    { key: 'period_amount', label: 'DÖNEM BEDELİ (Tutarı)', width: 130 },
    { key: 'total_invoiced', label: 'KESİLEN FATURA TOPLAM', width: 140 },
];

export const MONTH_COLUMN_WIDTH = 112;

export function formatCurrencyTR(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (Number.isNaN(num)) return null;
    return `${new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num)} TL`;
}

/**
 * Form/API tutarını sayıya çevirir.
 * - "29100.00" / "29100" → düz ondalık (nokta ondalık ayracı)
 * - "29.100" / "29.100,00" → TR binlik formatı
 */
export function parseCurrencyInput(value) {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) return null;

    const hasComma = trimmed.includes(',');
    const dotCount = (trimmed.match(/\./g) || []).length;
    const isThousandGrouped = /^-?\d{1,3}(\.\d{3})+$/.test(trimmed);

    if (hasComma || dotCount > 1 || isThousandGrouped) {
        const normalized = trimmed.replace(/\./g, '').replace(',', '.');
        const num = Number(normalized);
        return Number.isNaN(num) ? null : num;
    }

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        return Number.isNaN(num) ? null : num;
    }

    return null;
}

/** Input value için temiz sayı string'i (örn: 29100.5 → "29100.5") */
export function toAmountInputValue(value) {
    const num = parseCurrencyInput(value);
    if (num === null) return '';
    // Gereksiz trailing sıfırları atmadan sabit 2 hane yerine ham sayı
    return String(num);
}

export function getInvoiceForMonth(invoices, month) {
    if (!Array.isArray(invoices)) return null;
    return invoices.find((inv) => Number(inv.month) === Number(month)) || null;
}

export function sumInvoiceAmounts(invoices) {
    if (!Array.isArray(invoices)) return 0;
    return invoices.reduce((sum, inv) => {
        if (inv.status !== 'completed') return sum;
        const amount = Number(inv.amount);
        if (Number.isNaN(amount)) return sum;
        return sum + amount;
    }, 0);
}

export function isContractFullyInvoiced(contract) {
    const totalAmount = Number(contract?.total_amount);
    if (Number.isNaN(totalAmount) || totalAmount <= 0) return false;
    const invoiced = sumInvoiceAmounts(contract?.invoices);
    return Math.round(invoiced * 100) === Math.round(totalAmount * 100);
}

export function isZeroAmountContract(contract) {
    const totalAmount = Number(contract?.total_amount);
    return !Number.isNaN(totalAmount) && totalAmount === 0;
}

export function getZeroAmountMonthCellClass({ interactive = false } = {}) {
    return interactive
        ? 'bg-purple-600 text-white font-semibold hover:bg-purple-500'
        : 'bg-purple-600 text-white font-semibold';
}

export function isContractPartiallyInvoiced(contract) {
    const totalAmount = Number(contract?.total_amount);
    if (Number.isNaN(totalAmount) || totalAmount <= 0) return false;
    return !isContractFullyInvoiced(contract);
}

export function isContractEndingSoon(contract, { withinDays = 30 } = {}) {
    if (!contract?.end_date) return false;

    const endDate = new Date(String(contract.end_date).split('T')[0]);
    if (Number.isNaN(endDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(limit.getDate() + withinDays);

    return endDate <= limit;
}

export function matchesContractStatusFilter(contract, statusFilter) {
    if (statusFilter === 'HEPSİ') return true;

    switch (statusFilter) {
        case 'TAM FATURALANAN':
            return isContractFullyInvoiced(contract);
        case 'EKSİK FATURALANAN':
            return isContractPartiallyInvoiced(contract);
        case 'SÖZLEŞMESİ BİTEN / BİTMEK ÜZERE':
            return isContractEndingSoon(contract);
        default:
            return true;
    }
}

export const CONTRACT_STATUS_FILTER_OPTIONS = [
    { value: 'TAM FATURALANAN', label: 'Tam Faturalanan' },
    { value: 'EKSİK FATURALANAN', label: 'Eksik Faturalanan' },
    { value: 'SÖZLEŞMESİ BİTEN / BİTMEK ÜZERE', label: 'Sözleşmesi Biten / Bitmek Üzere' },
];

export const CONTRACT_STATUS_FILTER_ACTIVE_STYLES = {
    HEPSİ: 'bg-white text-blue-600 shadow-sm',
    'TAM FATURALANAN': 'text-white bg-emerald-700 shadow-sm',
    'EKSİK FATURALANAN': 'text-white bg-amber-700 shadow-sm',
    'SÖZLEŞMESİ BİTEN / BİTMEK ÜZERE': 'text-white bg-red-600 shadow-sm',
};

export const CONTRACT_STATUS_FILTER_INACTIVE_STYLES = {
    HEPSİ: 'hover:bg-white/40',
    'TAM FATURALANAN': 'hover:text-emerald-700 hover:bg-white/40',
    'EKSİK FATURALANAN': 'hover:text-amber-700 hover:bg-white/40',
    'SÖZLEŞMESİ BİTEN / BİTMEK ÜZERE': 'hover:text-red-600 hover:bg-white/40',
};

export function hasInvoiceData(invoice) {
    if (!invoice) return false;
    if (invoice.status && invoice.status !== 'empty') return true;
    return invoice.amount !== null && invoice.amount !== undefined && invoice.amount !== '';
}

export function getInvoiceStatusCellClass(status, { interactive = false } = {}) {
    const normalized = String(status || 'empty').toLowerCase();

    switch (normalized) {
        case 'completed':
            return interactive
                ? 'bg-green-600 text-white font-semibold hover:bg-green-500'
                : 'bg-green-600 text-white font-semibold';
        case 'planned':
            return interactive
                ? 'bg-yellow-300 text-amber-800 font-semibold hover:bg-amber-400'
                : 'bg-yellow-300 text-amber-800 font-semibold';
        case 'postponed':
            return interactive
                ? 'bg-orange-300 text-orange-800 font-semibold hover:bg-orange-200'
                : 'bg-orange-300 text-orange-800 font-semibold';
        case 'failed':
            return interactive
                ? 'bg-red-600 text-red-100 font-semibold hover:bg-red-500'
                : 'bg-red-600 text-red-100 font-semibold';
        default:
            return interactive
                ? 'text-slate-300 hover:bg-gray-100 hover:text-slate-500'
                : 'text-slate-300';
    }
}

export function buildYearOptions(centerYear = new Date().getFullYear()) {
    const years = [];
    for (let y = centerYear - 3; y <= centerYear + 2; y += 1) {
        years.push(y);
    }
    return years;
}

export const MONTHLY_SUMMARY_GROUPS = [
    { status: 'planned', label: 'Planlandı' },
    { status: 'completed', label: 'Tamamlandı' },
    { status: 'postponed', label: 'Ertelendi' },
    { status: 'failed', label: 'İptal / Başarısız' },
];

export function getMonthlyMaintenanceSummary(contracts, month) {
    const grouped = Object.fromEntries(
        MONTHLY_SUMMARY_GROUPS.map((group) => [group.status, []]),
    );

    if (!Array.isArray(contracts)) return grouped;

    const entries = contracts
        .map((contract) => {
            const invoice = getInvoiceForMonth(contract.invoices, month);
            if (!hasInvoiceData(invoice)) return null;

            const status = String(invoice.status || 'empty').toLowerCase();
            if (status === 'empty' || !grouped[status]) return null;

            return { contract, invoice, status };
        })
        .filter(Boolean)
        .sort((a, b) =>
            (a.contract.company_name || '').localeCompare(b.contract.company_name || '', 'tr-TR'),
        );

    for (const entry of entries) {
        grouped[entry.status].push(entry);
    }

    return grouped;
}

export function getMonthLabel(month) {
    return MONTH_LABELS.find((item) => item.month === month)?.label || String(month);
}

export function computeMaintenanceContractStats(contracts, month) {
    let totalContractAmount = 0;
    let totalInvoiced = 0;
    let plannedThisMonth = 0;
    let completedThisMonth = 0;

    if (!Array.isArray(contracts)) {
        return {
            totalContractAmount: 0,
            totalInvoiced: 0,
            remainingAmount: 0,
            plannedThisMonth: 0,
            completedThisMonth: 0,
        };
    }

    for (const contract of contracts) {
        const amount = Number(contract.total_amount);
        if (!Number.isNaN(amount)) {
            totalContractAmount += amount;
        }
        totalInvoiced += sumInvoiceAmounts(contract.invoices);

        const invoice = getInvoiceForMonth(contract.invoices, month);
        if (!hasInvoiceData(invoice)) continue;

        const status = String(invoice.status || 'empty').toLowerCase();
        if (status === 'planned') plannedThisMonth += 1;
        if (status === 'completed') completedThisMonth += 1;
    }

    return {
        totalContractAmount,
        totalInvoiced,
        remainingAmount: totalContractAmount - totalInvoiced,
        plannedThisMonth,
        completedThisMonth,
    };
}
