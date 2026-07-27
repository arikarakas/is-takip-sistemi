import {
    computeMaintenanceContractStats,
    formatCurrencyTR,
    getMonthLabel,
} from '../../constants/maintenanceContracts';

function SummaryCard({ label, value, hint, tone = 'default', onClick }) {
    const toneClasses = {
        default: 'text-slate-800',
        emerald: 'text-emerald-700',
        amber: 'text-amber-700',
    };

    const Wrapper = onClick ? 'button' : 'div';
    const wrapperProps = onClick
        ? {
            type: 'button',
            onClick,
            className: 'rounded-2xl border border-slate-100 bg-white shadow-sm p-4 text-left hover:border-slate-200 hover:shadow-md transition cursor-pointer',
        }
        : {
            className: 'rounded-2xl border border-slate-100 bg-white shadow-sm p-4',
        };

    return (
        <Wrapper {...wrapperProps}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className={`mt-1 text-lg sm:text-xl font-black tabular-nums ${toneClasses[tone] || toneClasses.default}`}>
                {value}
            </p>
            {hint && (
                <p className="mt-1 text-xs text-slate-500">{hint}</p>
            )}
        </Wrapper>
    );
}

function MaintenanceContractSummaryCards({ contracts, year, month, onMonthSummaryClick }) {
    const stats = computeMaintenanceContractStats(contracts, month);
    const monthLabel = getMonthLabel(month);
    const monthTitle = monthLabel.charAt(0) + monthLabel.slice(1).toLowerCase();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
            <SummaryCard
                label="Sözleşme Bedeli Toplamı"
                value={formatCurrencyTR(stats.totalContractAmount) || '0,00 TL'}
            />
            <SummaryCard
                label="Kesilen Fatura Toplamı"
                value={formatCurrencyTR(stats.totalInvoiced) || '0,00 TL'}
                tone="emerald"
            />
            <SummaryCard
                label="Kalan Tutar"
                value={formatCurrencyTR(stats.remainingAmount) || '0,00 TL'}
                tone={stats.remainingAmount > 0 ? 'amber' : 'emerald'}
            />
            <SummaryCard
                label={`${monthTitle} ${year}`}
                value={`${stats.plannedThisMonth} planlı · ${stats.completedThisMonth} tamamlandı`}
                hint="Aylık bakım listesini görmek için tıklayın"
                onClick={onMonthSummaryClick ? () => onMonthSummaryClick(month) : undefined}
            />
        </div>
    );
}

export default MaintenanceContractSummaryCards;
