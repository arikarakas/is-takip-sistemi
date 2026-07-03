import {
    PROJECT_TABLE_COLUMNS,
    PROJECT_TABLE_WIDTH,
    STICKY_COLUMN_OFFSETS,
} from '../../constants/projects';
import ProjectCell from './ProjectCell';

function getStickyCellClass(key, { isHeader = false, isEvenRow = false } = {}) {
    if (!(key in STICKY_COLUMN_OFFSETS)) return '';
    const bg = isHeader
        ? 'bg-slate-50'
        : isEvenRow
            ? 'bg-slate-50/40 group-hover:bg-slate-50/90'
            : 'bg-white group-hover:bg-slate-50/90';
    const border = key === 'title' ? 'border-r border-slate-200/80 shadow-[4px_0_8px_-4px_rgba(15,23,42,0.08)]' : '';
    return `sticky z-[1] ${bg} ${border} ${isHeader ? 'z-[2]' : ''}`;
}

function getStickyStyle(key) {
    if (!(key in STICKY_COLUMN_OFFSETS)) return undefined;
    return { left: STICKY_COLUMN_OFFSETS[key] };
}

function ProjectTable({ projects, onRowClick, sortKey, sortDirection, onSort }) {
    return (
        <div className="w-full min-w-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-sm font-semibold text-slate-700">
                    {projects.length} proje listeleniyor
                </p>
                <p className="text-xs text-slate-400 hidden sm:block">
                    Daha fazla kolon için sağa kaydırın →
                </p>
            </div>
            <div className="relative">
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-16rem)]">
                    <table
                        className="table-fixed text-left border-collapse"
                        style={{ width: PROJECT_TABLE_WIDTH, minWidth: PROJECT_TABLE_WIDTH }}
                    >
                        <colgroup>
                            {PROJECT_TABLE_COLUMNS.map((col) => (
                                <col key={col.key} style={{ width: col.width }} />
                            ))}
                        </colgroup>
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-50/95 backdrop-blur border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
                                {PROJECT_TABLE_COLUMNS.map((col) => {
                                    const isCurrentSort = sortKey === col.key;
                                    return (
                                        <th
                                            key={col.key}
                                            style={getStickyStyle(col.key)}
                                            onClick={() => onSort(col.key)}
                                            className={`py-3 px-5 whitespace-normal leading-snug cursor-pointer select-none hover:bg-slate-100 hover:text-slate-800 transition ${getStickyCellClass(col.key, { isHeader: true })}`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>{col.label}</span>
                                                {isCurrentSort && (
                                                    <span className="text-blue-600 font-bold">
                                                        {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project, rowIndex) => (
                                <tr
                                    key={project.id}
                                    onClick={() => onRowClick(project)}
                                    className={`group border-b border-slate-100/80 transition-colors hover:bg-slate-50/90 cursor-pointer ${rowIndex % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                                >
                                    {PROJECT_TABLE_COLUMNS.map((col) => (
                                        <td
                                            key={col.key}
                                            style={getStickyStyle(col.key)}
                                            className={`py-3 px-5 align-middle text-sm text-slate-600 ${getStickyCellClass(col.key, { isEvenRow: rowIndex % 2 === 1 })} ${col.key === 'notlar' ? 'max-w-0' : ''}`}
                                        >
                                            <ProjectCell project={project} columnKey={col.key} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-white/90 to-transparent" />
            </div>
        </div>
    );
}

export default ProjectTable;
