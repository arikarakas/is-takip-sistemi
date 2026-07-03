function ProgressBar({ value }) {
    const pct = Math.min(100, Math.max(0, Number(value) || 0));
    const barColor = pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-400';

    return (
        <div className="flex items-center gap-2.5 min-w-[130px]">
            <span className="text-xs font-semibold text-slate-500 tabular-nums shrink-0">%{pct}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default ProgressBar;
