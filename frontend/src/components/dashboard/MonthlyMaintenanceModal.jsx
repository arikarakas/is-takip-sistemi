import {
    formatCurrencyTR,
    getInvoiceStatusCellClass,
    getMonthlyMaintenanceSummary,
    getMonthLabel,
    MONTHLY_SUMMARY_GROUPS,
} from '../../constants/maintenanceContracts';

function SummaryRow({ entry, canEdit, onEntryClick }) {
    const { contract, invoice } = entry;
    const amountLabel = formatCurrencyTR(invoice?.amount);
    const statusClass = getInvoiceStatusCellClass(invoice?.status, { interactive: false });
    const notes = invoice?.notes?.trim();

    const content = (
        <>
            <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 truncate">{contract.company_name}</p>
                {notes && (
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{notes}</p>
                )}
            </div>
            <div className="shrink-0 flex items-center gap-2">
                {amountLabel && (
                    <span className={`rounded-lg px-2 py-1 text-xs tabular-nums ${statusClass}`}>
                        {amountLabel}
                    </span>
                )}
            </div>
        </>
    );

    if (canEdit && onEntryClick) {
        return (
            <button
                type="button"
                onClick={() => onEntryClick(contract, invoice)}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50 transition cursor-pointer"
            >
                {content}
            </button>
        );
    }

    return (
        <div className="flex items-center justify-between gap-4 px-4 py-3">
            {content}
        </div>
    );
}

function MonthlyMaintenanceModal({
    isOpen,
    onClose,
    contracts,
    year,
    month,
    canEdit = false,
    onEntryClick,
}) {
    if (!isOpen || !month) return null;

    const grouped = getMonthlyMaintenanceSummary(contracts, month);
    const totalCount = MONTHLY_SUMMARY_GROUPS.reduce(
        (sum, group) => sum + grouped[group.status].length,
        0,
    );
    const monthLabel = getMonthLabel(month);
    const titleMonth = monthLabel.charAt(0) + monthLabel.slice(1).toLowerCase();

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-start gap-4 p-6 pb-4 shrink-0 border-b border-slate-100">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Aylık Bakım Listesi
                        </p>
                        <h3 className="text-lg font-black text-slate-800 leading-snug">
                            {titleMonth} {year}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {totalCount > 0
                                ? `${totalCount} kayıt`
                                : 'Bu ay için işaretlenmiş bakım kaydı yok'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-xl shrink-0"
                        aria-label="Kapat"
                    >
                        ✕
                    </button>
                </header>

                <div className="overflow-y-auto px-6 py-4">
                    {totalCount === 0 ? (
                        <div className="py-10 text-center text-sm text-slate-400">
                            Planlandı, tamamlandı veya ertelendi olarak işaretlenmiş firma bulunmuyor.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {MONTHLY_SUMMARY_GROUPS.map((group) => {
                                const items = grouped[group.status];
                                if (items.length === 0) return null;

                                return (
                                    <section key={group.status}>
                                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {group.label} ({items.length})
                                        </h4>
                                        <ul className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                                            {items.map((entry) => (
                                                <li key={entry.contract.id}>
                                                    <SummaryRow
                                                        entry={entry}
                                                        canEdit={canEdit}
                                                        onEntryClick={onEntryClick}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MonthlyMaintenanceModal;
