import { useState } from 'react';
import { LABEL_CLASS_NAME } from '../../constants/projects';
import {
    INVOICE_STATUS_OPTIONS,
    MONTH_LABELS,
    toAmountInputValue,
} from '../../constants/maintenanceContracts';
import { clearInvoiceAction } from '../../features/maintenanceContracts/maintenanceContractActions';

const INPUT_CLASS =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500';

function resolveInitialStatus(invoice) {
    if (invoice?.status && invoice.status !== 'empty') return invoice.status;
    return 'completed';
}

function resolveInitialAmount(invoice, contract, status) {
    if (invoice?.amount !== null && invoice?.amount !== undefined && invoice?.amount !== '') {
        return toAmountInputValue(invoice.amount);
    }
    if (status === 'completed' && contract?.period_amount != null) {
        return toAmountInputValue(contract.period_amount);
    }
    return '';
}

function InvoiceModal({
    isOpen,
    onClose,
    formAction,
    formState,
    isPending,
    context,
    onCleared,
}) {
    const [isClearing, setIsClearing] = useState(false);
    const [clearError, setClearError] = useState(null);

    if (!isOpen || !context) return null;

    return (
        <InvoiceModalForm
            key={`${context.contract.id}-${context.month}-${context.year}`}
            context={context}
            formAction={formAction}
            formState={formState}
            isPending={isPending}
            onClose={onClose}
            onCleared={onCleared}
            isClearing={isClearing}
            setIsClearing={setIsClearing}
            clearError={clearError}
            setClearError={setClearError}
        />
    );
}

function InvoiceModalForm({
    context,
    formAction,
    formState,
    isPending,
    onClose,
    onCleared,
    isClearing,
    setIsClearing,
    clearError,
    setClearError,
}) {
    const { contract, year, month, invoice } = context;
    const monthLabel = MONTH_LABELS.find((m) => m.month === month)?.label || month;
    const hasExisting = !!invoice && invoice.status !== 'empty';

    const [status, setStatus] = useState(() => resolveInitialStatus(invoice));
    const [amount, setAmount] = useState(() => resolveInitialAmount(invoice, contract, resolveInitialStatus(invoice)));

    function handleStatusChange(event) {
        const nextStatus = event.target.value;
        setStatus(nextStatus);
        if (nextStatus === 'completed') {
            setAmount(toAmountInputValue(contract?.period_amount));
        }
    }

    async function handleClear() {
        if (!hasExisting) {
            onClose();
            return;
        }

        const confirmed = window.confirm(
            'Bu ayın fatura/bakım kaydını temizlemek istediğinize emin misiniz?',
        );
        if (!confirmed) return;

        setIsClearing(true);
        setClearError(null);
        const result = await clearInvoiceAction(contract.id, year, month);
        setIsClearing(false);

        if (result.success) {
            onCleared?.();
            onClose();
        } else {
            setClearError(result.error);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-start gap-4 p-6 pb-4 shrink-0">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Fatura / Bakım Kaydı Düzenle
                        </p>
                        <h3 className="text-lg font-black text-slate-800 leading-snug">
                            {contract.company_name} — {monthLabel.charAt(0) + monthLabel.slice(1).toLowerCase()} {year} Fatura/Bakım Girişi
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-xl shrink-0"
                    >
                        ✕
                    </button>
                </header>

                <div className="overflow-y-auto px-6 pb-6">
                    {(formState?.error || clearError) && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium">
                            {formState?.error || clearError}
                        </div>
                    )}

                    <form action={formAction} className="space-y-4" autoComplete="off">
                        <input type="hidden" name="contractId" value={contract.id} />
                        <input type="hidden" name="year" value={year} />
                        <input type="hidden" name="month" value={month} />
                        <input type="hidden" name="period_amount" value={toAmountInputValue(contract.period_amount)} />

                        <div>
                            <label className={LABEL_CLASS_NAME}>Fatura / Bakım Tutarı (TL)</label>
                            <input
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Örn: 29100.00"
                                className={INPUT_CLASS}
                            />
                            {status === 'completed' && (
                                <p className="mt-1.5 text-[11px] text-slate-400">
                                    Completed seçildiğinde tutar dönem bedeli ile doldurulur.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={LABEL_CLASS_NAME}>Durum</label>
                            <select
                                name="status"
                                value={status}
                                onChange={handleStatusChange}
                                className={INPUT_CLASS}
                            >
                                {INVOICE_STATUS_OPTIONS.filter((opt) => opt.value !== 'empty').map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={LABEL_CLASS_NAME}>Notlar</label>
                            <textarea
                                name="notes"
                                rows={3}
                                defaultValue={invoice?.notes || ''}
                                placeholder="Opsiyonel not..."
                                className={`${INPUT_CLASS} resize-none`}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {hasExisting && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={isClearing || isPending}
                                    className="flex-1 rounded-xl bg-red-50 text-red-600 py-3 text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {isClearing ? 'Temizleniyor...' : 'Sil / Temizle'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl bg-slate-100 text-slate-600 py-3 text-sm font-semibold hover:bg-slate-200 transition cursor-pointer"
                            >
                                Vazgeç
                            </button>
                            <button
                                type="submit"
                                disabled={isPending || isClearing}
                                className="flex-1 rounded-xl bg-emerald-600 text-white py-3 text-sm font-semibold hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
                            >
                                {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default InvoiceModal;
