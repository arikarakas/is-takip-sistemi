import {
    PROJECT_TABLE_COLUMNS,
    PROJECT_TABLE_WIDTH,
    STICKY_COLUMN_OFFSETS,
} from '../../constants/projects';
import ProjectCell from './ProjectCell';
import { Fragment, useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AnimatedCollapse } from './Accordion';
import ProjectAksiyonHistory from './ProjectAksiyonHistory';

function getStickyCellClass(key, { isHeader = false, isEvenRow = false, isCompleted = false } = {}) {
    if (!(key in STICKY_COLUMN_OFFSETS)) return '';
    const bg = isHeader
        ? 'bg-slate-50'
        : isCompleted
            ? 'bg-emerald-50/60 group-hover:bg-emerald-50'
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

function isProjectCompleted(project) {
    return (project.durum || '').trim().toLocaleUpperCase('tr-TR') === 'TAMAMLANDI';
}

function ProjectTable({ projects, onRowClick, sortKey, sortDirection, onSort }) {

    const [hoveredProjectId, setHoveredProjectId] = useState(null);
    const [expandedProjectId, setExpandedProjectId] = useState(null);

    function toggleProjectHistory(projectId) {
        setExpandedProjectId((prev) => (prev === projectId ? null : projectId));
    }

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
                            <tr className="bg-slate-50/95 backdrop-blur border-b border-slate-200 text-[12px] font-bold uppercase tracking-wide text-slate-500 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
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
                            {projects.map((project, rowIndex) => {
                                const isCompleted = isProjectCompleted(project);
                                const isHovered = hoveredProjectId === project.id;
                                const isExpanded = expandedProjectId === project.id;
                                return (
                                    <Fragment key={project.id}>
                                        <tr
                                            onMouseEnter={() => setHoveredProjectId(project.id)}
                                            onMouseLeave={() => setHoveredProjectId(null)}
                                            onClick={(e) => {
                                                if (e.target.closest('[data-sira-cell]') && hoveredProjectId === project.id) return;
                                                onRowClick(project);
                                            }}
                                            className={`group border-b border-slate-100/80 transition-colors cursor-pointer ${
                                                isExpanded
                                                    ? 'bg-amber-50/60'
                                                    : isCompleted
                                                        ? 'bg-emerald-100/90 hover:bg-emerald-50'
                                                        : rowIndex % 2 === 1
                                                            ? 'bg-slate-50/40 hover:bg-slate-50/90'
                                                            : 'bg-white hover:bg-slate-50/90'
                                            }`}
                                        >
                                            {PROJECT_TABLE_COLUMNS.map((col) => {
                                                const isSiraCell = col.key === 'sira';
                                                return (
                                                <td
                                                    key={col.key}
                                                    data-sira-cell={isSiraCell || undefined}
                                                    style={getStickyStyle(col.key)}
                                                    onClick={(e) => {
                                                        if (isSiraCell && isHovered) {
                                                            e.stopPropagation();
                                                            toggleProjectHistory(project.id);
                                                        }
                                                    }}
                                                    className={`align-middle text-sm text-slate-600 ${isSiraCell ? `relative h-px p-0 overflow-hidden ${isHovered ? 'z-3 cursor-pointer hover:bg-amber-100/90 duration-125 ease-in' : ''} ${isExpanded ? 'bg-amber-100/90' : ''}` : 'py-3 px-5'} ${getStickyCellClass(col.key, { isEvenRow: rowIndex % 2 === 1, isCompleted })} ${col.key === 'notlar' ? 'max-w-0' : ''}`}
                                                >
                                                    <ProjectCell project={project} columnKey={col.key} isHovered={isHovered} />
                                                </td>
                                                );
                                            })}
                                        </tr>
                                        <tr className={isExpanded ? '' : 'pointer-events-none'}>
                                            <td colSpan={PROJECT_TABLE_COLUMNS.length} className="p-0">
                                                <AnimatedCollapse open={isExpanded}>
                                                    <div className="border-b border-amber-100 bg-amber-50/40">
                                                        <Accordion type="single" collapsible defaultValue="gecmis">
                                                            <AccordionItem value="gecmis" className="border-0 rounded-none bg-transparent">
                                                                <AccordionTrigger className="px-5 py-3 text-amber-900 hover:bg-amber-50/80">
                                                                    {project.title} — Yapılan İş Geçmişi
                                                                </AccordionTrigger>
                                                                <AccordionContent contentClassName="p-0 text-slate-600">
                                                                    <ProjectAksiyonHistory
                                                                        projectId={project.id}
                                                                        isActive={isExpanded}
                                                                    />
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>
                                                    </div>
                                                </AnimatedCollapse>
                                            </td>
                                        </tr>
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-white/90 to-transparent" />
            </div>
        </div>
    );
}

export default ProjectTable;
