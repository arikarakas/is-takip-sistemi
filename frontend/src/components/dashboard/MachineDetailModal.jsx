import { formatDateTR } from '../../utils/date';

const labelClassName = 'text-xs font-bold uppercase tracking-wider text-slate-400';

function DetailField({ label, value, children, preWrap = false }) {
    const content = children ?? value;

    return (
        <div>
            <p className={`${labelClassName} mb-1`}>{label}</p>
            {content != null && content !== ''
                ? (
                    <p className={`text-slate-800 font-medium leading-snug ${preWrap ? 'whitespace-pre-wrap' : ''}`}>
                        {content}
                    </p>
                )
                : <p className="text-slate-300">—</p>}
        </div>
    );
}

function MachineDetailModal({ machine, onClose, onEditClick, onDelete, isDeleting, deleteError, isAdmin }) {
    if (!machine) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-start gap-4 p-6 pb-4 shrink-0 border-b border-slate-100">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                    machine.bakim
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                            >
                                {machine.bakim ? 'Bakım Yapıldı' : 'Bakım Bekliyor'}
                            </span>
                            {machine.sira != null && (
                                <span className="text-xl font-mono text-slate-400">SIRA: {machine.sira}</span>
                            )}
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight">{machine.ocak}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-xl shrink-0"
                    >
                        ✕
                    </button>
                </header>

                <div className="overflow-y-auto px-6 py-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailField label="MARKA" value={machine.marka} />
                        <DetailField label="HALAT BOYU" value={machine.halat_boyu} />
                        <DetailField label="SON BAKIM TARİHİ" value={formatDateTR(machine.bakim_tarih)} />
                        <DetailField label="SON HALAT DEĞİŞİM TARİHİ" value={formatDateTR(machine.halat_degisim_tarih)} />
                        <DetailField label="SON DEĞİŞİKLİĞİ YAPAN" value={machine.last_modified_by?.full_name || machine.last_modified_by?.username}/>
                        <DetailField label="GIND MANUEL KOD" value={machine.manuel_kod} />
                    </div>

                    <DetailField label="MAKİNE TİPİ" value={machine.tip} preWrap />

                </div>

                <footer className="px-6 py-4 border-t border-slate-100 shrink-0">
                    {deleteError && (
                        <p className="text-xs text-red-600 mb-3">{deleteError}</p>
                    )}
                    {isAdmin && (
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => onDelete(machine)}
                                disabled={isDeleting}
                                className="px-4 py-2.5 text-red-600 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Siliniyor...' : 'Makineyi Sil'}
                            </button>
                            <button
                                type="button"
                                onClick={() => onEditClick(machine)}
                                disabled={isDeleting}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                            >
                                Düzenle
                            </button>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
}

export default MachineDetailModal;
