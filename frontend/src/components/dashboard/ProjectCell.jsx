import { STATUS_STYLES } from '../../constants/projects';
import { formatDateTR } from '../../utils/date';
import ProgressBar from './ProgressBar';

function emptyCell(value) {
    if (value == null || value === '') {
        return <span className="text-slate-300 select-none">—</span>;
    }
    return value;
}

function getAciliyetStyle(value) {
    const normalized = String(value || '').toLocaleLowerCase('tr-TR');
    if (normalized.includes('çok acil')) {
        return 'bg-red-50 text-red-700 border-red-100';
    }
    if (normalized.includes('acil')) {
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    if (normalized.includes('normal')) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    return 'bg-violet-50 text-violet-700 border-violet-100';
}

function ProjectCell({ project, columnKey }) {
    switch (columnKey) {
        case 'sira':
            return (
                <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-bold text-slate-500 tabular-nums">
                    {project.sira}
                </span>
            );
        case 'title':
            return <span className="font-semibold text-slate-800 leading-snug">{project.title}</span>;
        case 'durum':
            return (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${STATUS_STYLES[project.durum] || STATUS_STYLES.BEKLEMEDE}`}>
                    {project.durum}
                </span>
            );
        case 'oncelik':
            return project.oncelik != null
                ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">P{project.oncelik}</span>
                : emptyCell(null);
        case 'aciliyet':
            return project.aciliyet
                ? <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap ${getAciliyetStyle(project.aciliyet)}`}>{project.aciliyet}</span>
                : emptyCell(null);
        case 'hedef_tarih': {
            const formatted = formatDateTR(project.hedef_tarih);
            return formatted
                ? <span className="tabular-nums text-slate-600 whitespace-nowrap">{formatted}</span>
                : emptyCell(null);
        }
        case 'aksiyon':
            return project.aksiyon
                ? <span className="leading-snug line-clamp-2 wrap-break-words whitespace-normal" title={project.aksiyon}>{project.aksiyon}</span>
                : emptyCell(null);
        case 'notlar':
            return project.notlar
                ? <span className="text-slate-500 line-clamp-2 wrap-break-words whitespace-normal" title={project.notlar}>{project.notlar}</span>
                : emptyCell(null);
        case 'tamamlanma':
            return <ProgressBar value={project.tamamlanma} />;
        case 'guncel_sira':
            return emptyCell(project.guncel_sira);
        default:
            return emptyCell(project[columnKey]);
    }
}

export default ProjectCell;
