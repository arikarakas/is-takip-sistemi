function isMaintenanceCompleted(machine) {
    return Boolean(machine.bakim);
}

function MachineCard({ machine, onClick }) {
    const isCompleted = isMaintenanceCompleted(machine);
    const bakimLabel = isCompleted ? 'Bakım Yapıldı' : 'Bakım Bekliyor';

    return (
        <div
            onClick={onClick}
            className={`p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer ${
                isCompleted
                    ? 'bg-emerald-100 border border-emerald-300 hover:bg-emerald-50'
                    : 'bg-white border border-slate-100 hover:bg-slate-50 hover:border-slate-300'
            }`}
        >
            <div>
                <div className="flex justify-between items-start gap-2">
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                    >
                        {bakimLabel}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-3 tracking-tight">{machine.ocak}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    {[machine.marka, machine.tip].filter(Boolean).join(' · ') || 'Tip belirtilmemiş'}
                </p>
            </div>
            <div className={`mt-6 pt-4 border-t flex justify-end ${isCompleted ? 'border-emerald-200' : 'border-slate-200'}`}>
                <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                    Detayları Yönet →
                </button>
            </div>
        </div>
    );
}

function MachineCards({ machines, onCardClick }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
                <MachineCard
                    key={machine.id}
                    machine={machine}
                    onClick={() => onCardClick?.(machine)}
                />
            ))}
        </div>
    );
}

export default MachineCards;
