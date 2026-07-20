import { formatDateLongTR, formatTimeTR, toDateKey } from '../../utils/appointmentCalendar';

function DetailRow({ icon, label, value, preWrap = false }) {
    return (
        <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                {value != null && value !== ''
                    ? (
                        <p className={`text-slate-800 font-semibold leading-snug break-words whitespace-pre-line ${preWrap ? 'whitespace-pre-wrap' : ''}`}>
                            {value}
                        </p>
                    )
                    : <p className="text-slate-300">—</p>}
            </div>
       
        </div>
    );
}

export default function AppointmentDetailModal({
    appointment,
    onClose,
    onEditClick,
    onDelete,
    isDeleting,
    deleteError,
}) {
    if (!appointment) return null;

    const dateKey = toDateKey(appointment.start_time);

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 px-6 py-6 text-white shrink-0">
                    <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-100/80 mb-1">
                                Randevu Detayı
                            </p>
                            <h3 className="text-xl font-black tracking-tight leading-tight">{appointment.title}</h3>
                            <p className="mt-2 text-sm font-medium text-blue-100/90">
                                {formatDateLongTR(dateKey)} · {formatTimeTR(appointment.start_time)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-white/70 hover:text-white font-bold cursor-pointer text-xl shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto px-6 py-5 space-y-4">
                    <DetailRow
                        label="Müşteri / Kişi"
                        value={appointment.client_name}
                        icon={
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        }
                    />
                    <DetailRow
                        label="Notlar"
                        value={appointment.description}
                        preWrap
                        icon={
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                            </svg>
                        }
                    />
                </div>

                <footer className="px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
                    {deleteError && (
                        <p className="text-xs text-red-600 mb-3">{deleteError}</p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => onDelete(appointment)}
                            disabled={isDeleting}
                            className="px-4 py-2.5 text-red-600 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? 'Siliniyor...' : 'Sil'}
                        </button>
                        <button
                            type="button"
                            onClick={() => onEditClick(appointment)}
                            disabled={isDeleting}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                        >
                            Düzenle
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
