import { formatDateTR } from '../../utils/date';
import {
    CONTRACT_FIXED_COLUMNS,
    MONTH_COLUMN_WIDTH,
    MONTH_LABELS,
    formatCurrencyTR,
    getInvoiceForMonth,
    getInvoiceStatusCellClass,
    getZeroAmountMonthCellClass,
    hasInvoiceData,
    isContractFullyInvoiced,
    isZeroAmountContract,
    sumInvoiceAmounts,
} from '../../constants/maintenanceContracts';

const FIXED_TABLE_WIDTH = CONTRACT_FIXED_COLUMNS.reduce((sum, col) => sum + col.width, 0)
    + (MONTH_LABELS.length * MONTH_COLUMN_WIDTH);

const MONTH_COLUMN_DIVIDER_CLASS = 'border-l border-slate-200';

function renderFixedCell(contract, columnKey, index) {
    switch (columnKey) {
        case 'company_name':
            return contract.company_name || '—';
        case 'sira':
            return index + 1;
        case 'maintenance_count':
            return contract.maintenance_count ?? '—';
        case 'period_type':
            return contract.period_type || '—';
        case 'start_date':
            return formatDateTR(contract.start_date) || '—';
        case 'end_date':
            return formatDateTR(contract.end_date) || '—';
        case 'total_amount':
            return formatCurrencyTR(contract.total_amount) || '—';
        case 'payment_term':
            return contract.payment_term || '—';
        case 'period_amount':
            return formatCurrencyTR(contract.period_amount) || '—';
        case 'total_invoiced': {
            const total = sumInvoiceAmounts(contract.invoices);
            return formatCurrencyTR(total) || '0,00 TL';
        }
        default:
            return '—';
    }
}

function MaintenanceContractTable({
    contracts,
    year,
    onCompanyClick,
    onMonthCellClick,
    onMonthHeaderClick,
    canEdit = true,
}) {
    return (
        <div className="w-full min-w-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-sm font-semibold text-slate-700">
                    {contracts.length} sözleşme — {year}
                </p>
                <p className="text-xs text-slate-400 hidden sm:block">
                    Aylar için sağa kaydırın →
                </p>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-16rem)]">
                <table
                    className="table-fixed text-left border-collapse"
                    style={{ width: FIXED_TABLE_WIDTH, minWidth: FIXED_TABLE_WIDTH }}
                >
                    <colgroup>
                        {CONTRACT_FIXED_COLUMNS.map((col) => (
                            <col key={col.key} style={{ width: col.width }} />
                        ))}
                        {MONTH_LABELS.map((m) => (
                            <col key={m.month} style={{ width: MONTH_COLUMN_WIDTH }} />
                        ))}
                    </colgroup>

                    <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-50/95 backdrop-blur border-b border-slate-200 text-[12px] font-bold uppercase tracking-wide text-slate-500 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
                            {CONTRACT_FIXED_COLUMNS.map((col) => {
                                const isSticky = col.key === 'company_name';
                                const isTotal = col.key === 'total_invoiced';
                                return (
                                    <th
                                        key={col.key}
                                        className={`py-3 px-3 whitespace-normal leading-snug ${
                                            isSticky
                                                ? 'sticky left-0 z-20 bg-slate-50 border-r border-slate-200/80 shadow-[4px_0_8px_-4px_rgba(15,23,42,0.08)]'
                                                : ''
                                        } ${isTotal ? 'text-emerald-700 font-black' : ''}`}
                                    >
                                        {col.label}
                                    </th>
                                );
                            })}
                            {MONTH_LABELS.map((m) => (
                                <th
                                    key={m.month}
                                    className={`p-0 whitespace-nowrap ${MONTH_COLUMN_DIVIDER_CLASS}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onMonthHeaderClick?.(m.month)}
                                        className="flex w-full h-full min-h-11 items-center justify-center px-2 py-7 text-[14px] font-bold uppercase tracking-wide text-slate-500 hover:bg-slate-200/70 hover:text-blue-600 transition-all cursor-pointer"
                                        title={`${m.label} ${year} bakım listesini göster`}
                                    >
                                        {m.label}
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {contracts.map((contract, index) => {
                            const isEven = index % 2 === 0;
                            const isFullyInvoiced = isContractFullyInvoiced(contract);
                            const isZeroAmount = isZeroAmountContract(contract);
                            return (
                                <tr
                                    key={contract.id}
                                    className={`group border-b border-slate-100 transition ${
                                        isEven ? 'bg-white' : 'bg-slate-50/40'
                                    } hover:bg-slate-50/90`}
                                >
                                    {CONTRACT_FIXED_COLUMNS.map((col) => {
                                        const isSticky = col.key === 'company_name';
                                        const isTotal = col.key === 'total_invoiced';
                                        const isDate = col.key === 'start_date' || col.key === 'end_date';
                                        const stickyBg = isEven
                                            ? 'bg-white group-hover:bg-slate-50/90'
                                            : 'bg-slate-50/40 group-hover:bg-slate-50/90';

                                        return (
                                            <td
                                                key={col.key}
                                                className={`py-2.5 px-3 text-sm text-slate-700 align-middle ${
                                                    isSticky
                                                        ? `sticky left-0 z-1 border-r border-slate-200/80 shadow-[4px_0_8px_-4px_rgba(15,23,42,0.08)] ${stickyBg}`
                                                        : ''
                                                } ${
                                                    isTotal
                                                        ? isFullyInvoiced
                                                            ? 'bg-emerald-600 text-white font-bold'
                                                            : 'text-emerald-700 font-bold'
                                                        : ''
                                                } ${isDate ? 'font-semibold' : ''}`}
                                            >
                                                {col.key === 'company_name' && canEdit ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onCompanyClick?.(contract)}
                                                        className="text-left font-semibold text-slate-800 hover:text-blue-600 transition cursor-pointer"
                                                        title="Sözleşmeyi düzenle"
                                                    >
                                                        {renderFixedCell(contract, col.key, index)}
                                                    </button>
                                                ) : col.key === 'company_name' ? (
                                                    <span className="font-semibold text-slate-800">
                                                        {renderFixedCell(contract, col.key, index)}
                                                    </span>
                                                ) : (
                                                    <span className={col.key === 'sira' ? 'tabular-nums text-slate-500' : 'tabular-nums'}>
                                                        {renderFixedCell(contract, col.key, index)}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}

                                    {MONTH_LABELS.map((m) => {
                                        const invoice = getInvoiceForMonth(contract.invoices, m.month);
                                        const filled = hasInvoiceData(invoice);
                                        const amountLabel = formatCurrencyTR(invoice?.amount);
                                        const statusClass = isZeroAmount
                                            ? getZeroAmountMonthCellClass({ interactive: canEdit })
                                            : getInvoiceStatusCellClass(invoice?.status, {
                                                interactive: canEdit,
                                            });

                                        return (
                                            <td
                                                key={m.month}
                                                className={`p-1.5 align-middle ${MONTH_COLUMN_DIVIDER_CLASS}`}
                                            >
                                                {canEdit ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onMonthCellClick?.(contract, m.month, invoice)}
                                                        className={`w-full min-h-10 rounded-lg px-1.5 py-2 text-xs tabular-nums transition cursor-pointer ${statusClass}`}
                                                        title={`${contract.company_name} — ${m.label} ${year}`}
                                                    >
                                                        {filled && amountLabel ? amountLabel : '—'}
                                                    </button>
                                                ) : (
                                                    <div
                                                        className={`w-full min-h-10 rounded-lg px-1.5 py-2 text-xs tabular-nums flex items-center justify-center ${statusClass}`}
                                                    >
                                                        {filled && amountLabel ? amountLabel : '—'}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MaintenanceContractTable;
