import {
    PROJECT_TABLE_COLUMNS,
    PROJECT_TABLE_WIDTH,
    STICKY_COLUMN_OFFSETS,
} from '../../constants/projects';
import ProjectCell from './ProjectCell';
import { Fragment, useEffect, useState, useRef } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AnimatedCollapse } from './Accordion';
import ProjectAksiyonHistory from './ProjectAksiyonHistory';

function getRowBackground({ isHighlighted, isExpanded, isCompleted, isEvenRow }) {
    if (isHighlighted) return 'bg-blue-200';
    if (isExpanded) return 'bg-amber-50 group-hover:bg-amber-100';
    if (isCompleted) return 'bg-emerald-50 group-hover:bg-emerald-100';
    if (isEvenRow) return 'bg-slate-50 group-hover:bg-slate-100';
    return 'bg-white group-hover:bg-slate-100';
}

function getStickyCellClass(key, { isHeader = false } = {}) {
    if (!(key in STICKY_COLUMN_OFFSETS)) return '';
    const bg = isHeader ? 'bg-slate-50' : '';
    const border = key === 'title' ? 'border-r border-slate-200/80 shadow-[4px_0_8px_-4px_rgba(15,23,42,0.08)]' : '';
    return `sticky ${isHeader ? 'z-[2]' : 'z-[1]'} ${bg} ${border}`;
}

function getStickyStyle(key) {
    if (!(key in STICKY_COLUMN_OFFSETS)) return undefined;
    return { left: STICKY_COLUMN_OFFSETS[key] };
}

function isProjectCompleted(project) {
    return (project.durum || '').trim().toLocaleUpperCase('tr-TR') === 'TAMAMLANDI';
}

function ProjectTable({ projects, onRowClick, sortKey, sortDirection, onSort, highlightedProjectId, onHighlightComplete }) {

    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const tableBodyRef = useRef(null);
    const hasHighlightedProject = highlightedProjectId != null &&
        projects.some((project) => project.id === highlightedProjectId);

    useEffect(() => {
        if (!hasHighlightedProject || !tableBodyRef.current) return;
        const targetRow = tableBodyRef.current.querySelector(`tr[data-project-id="${highlightedProjectId}"]`);
        if (targetRow){
            targetRow.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
            });
            const timer = setTimeout(() => {
                onHighlightComplete?.(highlightedProjectId);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [highlightedProjectId, hasHighlightedProject, onHighlightComplete]);

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
                        <tbody ref={tableBodyRef} className="divide-y divide-slate-100 text-sm">
                            {projects.map((project, rowIndex) => {
                                const isCompleted = isProjectCompleted(project);
                                const isExpanded = expandedProjectId === project.id;
                                const isHighlighted = project.id === highlightedProjectId;
                                const rowBackground = getRowBackground({
                                    isHighlighted,
                                    isExpanded,
                                    isCompleted,
                                    isEvenRow: rowIndex % 2 === 1,
                                });
                                return (
                                    <Fragment key={project.id}>
                                        <tr
                                            key={project.id}
                                            data-project-id={project.id}
                                            onClick={() => onRowClick(project)}
                                            className={`group border-b border-slate-100/80 cursor-pointer ${
                                                isHighlighted
                                                    ? 'ring-2 ring-inset ring-amber-400 motion-safe:animate-pulse'
                                                    : ''
                                            }`}
                                        >
                                            {PROJECT_TABLE_COLUMNS.map((col) => (
                                                <td
                                                    key={col.key}
                                                    style={getStickyStyle(col.key)}
                                                    className={`align-middle text-sm text-slate-600 py-3 px-5 transition-colors ${rowBackground} ${getStickyCellClass(col.key)} ${col.key === 'notlar' ? 'max-w-0' : ''}`}
                                                >
                                                    {col.key === 'title' ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                aria-label={`${project.title} — Yapılan iş geçmişi`}
                                                                aria-expanded={isExpanded}
                                                                aria-controls={`project-history-${project.id}`}
                                                                title="Yapılan iş geçmişi"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    toggleProjectHistory(project.id);
                                                                }}
                                                                className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${isExpanded ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'text-slate-500 hover:bg-amber-200 hover:text-amber-800'}`}
                                                            >
                                                                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path
                                                                                d="M21 10H3M16 2V6M8 2V6M9 16L11 18L15.5 13.5M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                                                                                stroke="currentColor"
                                                                                strokeWidth="2"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                        </svg>
                                                            </button>
                                                            <div className="min-w-0 wrap-break-words">
                                                                <ProjectCell project={project} columnKey={col.key} />
                                                            </div>
                                                        </div>
                                                    ) : <ProjectCell project={project} columnKey={col.key} />}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className={isExpanded ? '' : 'pointer-events-none'}>
                                            <td colSpan={PROJECT_TABLE_COLUMNS.length} className="p-0">
                                                <AnimatedCollapse open={isExpanded}>
                                                    <div id={`project-history-${project.id}`} className="border-b border-amber-100 bg-amber-50/40">
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
