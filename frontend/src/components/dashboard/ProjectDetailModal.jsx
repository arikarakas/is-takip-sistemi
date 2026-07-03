import { STATUS_STYLES } from '../../constants/projects';
import { formatDateTR } from '../../utils/date';
import ProgressBar from './ProgressBar';

const labelClassName = 'text-xs font-bold uppercase tracking-wider text-slate-400';

function DetailField({ label, value, children }) {
    const content = children ?? value;

    return (
        <div>
            <p className={`${labelClassName} mb-1`}>{label}</p>
            {content != null && content !== ''
                ? <p className="text-slate-800 font-medium leading-snug">{content}</p>
                : <p className="text-slate-300">—</p>}
        </div>
    );
}

function ProjectDetailModal({ project, onClose, onEditClick, onDelete, isDeleting, deleteError }) {
    if (!project) return null;

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
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[project.durum] || STATUS_STYLES.BEKLEMEDE}`}>
                                {project.durum}
                            </span>
                            {project.sira != null && (
                                <span className="text-xl font-mono text-slate-400">SIRA: {project.sira}</span>
                            )}
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mt-2 tracking-tight">{project.title}</h3>
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
                        <DetailField label="MÜŞTERİ / PROJE" value={project.client} />
                        <DetailField label="SORUMLU KİŞİ(LER)" value={project.sorumlular} />
                        <DetailField label="İLGİLİ KİŞİ" value={project.ilgili} />
                        <DetailField label="HEDEF TARİH" value={formatDateTR(project.hedef_tarih)} />
                        <DetailField label="ÖNCELİK" value={project.oncelik != null ? `P${project.oncelik}` : null} />
                        <DetailField label="GÜNCEL SIRA" value={project.guncel_sira} />
                    </div>

                    <div>
                        <p className={`${labelClassName} mb-2`}>TAMAMLANMA</p>
                        <ProgressBar value={project.tamamlanma} />
                    </div>

                    <DetailField label="AKSIYON / SONRAKI ADIM" value={project.aksiyon} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailField label="ACİLİYET" value={project.aciliyet} />
                        <DetailField label="BEKLENEN ÇIKTı" value={project.beklenen} />
                        <DetailField label="RİSK / BAĞIMLIK" value={project.risk} />
                    </div>

                    <div>
                        <p className={`${labelClassName} mb-2`}>NOTLAR</p>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {project.notlar || <span className="text-slate-300">—</span>}
                        </div>
                    </div>
                </div>

                <footer className="px-6 py-4 border-t border-slate-100 shrink-0">
                    {deleteError && (
                        <p className="text-xs text-red-600 mb-3">{deleteError}</p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => onDelete(project)}
                            disabled={isDeleting}
                            className="px-4 py-2.5 text-red-600 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? 'Siliniyor...' : 'Projeyi Sil'}
                        </button>
                        <button
                            type="button"
                            onClick={() => onEditClick(project)}
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

export default ProjectDetailModal;
