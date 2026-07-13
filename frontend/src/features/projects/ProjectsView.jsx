import { useState, useEffect, useActionState, useRef } from 'react';
import { MenuIcon } from '../../components/dashboard/Sidebar';
import ProjectTable from '../../components/dashboard/ProjectTable';
import ProjectCards from '../../components/dashboard/ProjectCards';
import ProjectModal from '../../components/dashboard/ProjectModal';
import ImportModal from '../../components/dashboard/ImportModal';
import FilterPanel from '../../components/dashboard/FilterPanel';
import SplitText from '../../components/dashboard/SplitText';
import ShinyText from '../../components/dashboard/ShinyText';
import { createProjectAction } from './projectActions';
import { useProjectFilters } from './useProjectFilters';

export default function ProjectsView({
    projects,
    isLoading,
    error,
    onReload,
    onImport,
    sortKey,
    sortDirection,
    onSort,
    applySort,
    onRowClick,
    onOpenSidebar,
    unreadChangesCount,
    onNavigateToActivity,
}) {
    const [viewMode, setViewMode] = useState('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formState, formAction, isPending] = useActionState(createProjectAction, { success: false, error: null });
    const wasCreatePendingRef = useRef(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [importError, setImportError] = useState(null);

    const {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        isFilterPanelOpen,
        setIsFilterPanelOpen,
        isTimeFilterActive,
        setIsTimeFilterActive,
        timeSliderStep,
        setTimeSliderStep,
        priorityFilter,
        setPriorityFilter,
        priorityOptions,
        filteredProjects,
        resetAdvancedFilters,
    } = useProjectFilters(projects);

    const sortedProjects = applySort(filteredProjects);

    useEffect(() => {
        const wasPending = wasCreatePendingRef.current;
        wasCreatePendingRef.current = isPending;

        if (wasPending && !isPending && formState?.success && isModalOpen) {
            onReload();
            setIsModalOpen(false);
        }
    }, [formState?.success, isModalOpen, isPending, onReload]);

    async function handleImport(formData) {
        setIsImporting(true);
        setImportError(null);
        setImportResult(null);

        try {
            const result = await onImport(formData);
            setImportResult(result);
        } catch (err) {
            setImportError(err.message);
        } finally {
            setIsImporting(false);
        }
    }

    return (
        <>
            <header className="mb-8">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onOpenSidebar}
                            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                            aria-label="Menüyü aç"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            <SplitText
                                text="Proje ve İşlerin Takibi"
                                delay={50}
                                duration={1.25}
                                ease="power3.out"
                                splitType="chars"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                rootMargin="-100px"
                                textAlign="center"
                                showCallback
                            />
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 self-start lg:self-auto">
                        <div className="max-w-md w-60">
                            <input
                                type="text"
                                placeholder="Proje Ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 shadow-xs"
                            />
                        </div>
                        <div className="bg-slate-200 p-1 rounded-xl flex gap-1 text-sm font-semibold">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-4 py-2 rounded-lg transition cursor-pointer ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Tablo
                            </button>
                            <button
                                onClick={() => setViewMode('card')}
                                className={`px-4 py-2 rounded-lg transition cursor-pointer ${viewMode === 'card' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Kartlar
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setImportResult(null);
                                setImportError(null);
                                setIsImportOpen(true);
                            }}
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M21 3H3M18 13L12 7M12 7L6 13M12 7V21"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                İçe Aktar
                            </span>
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
                        >
                            + Yeni İş Ekle
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 select-none w-fit">
                        {['HEPSİ', 'AÇIK', 'BEKLEMEDE', 'DEVAM EDİYOR', 'TAMAMLANDI'].map((status) => {
                            const isActive = statusFilter === status;

                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                                    }`}
                                >
                                    {status}
                                </button>
                            );
                        })}
                    </div>

                    <FilterPanel
                        isOpen={isFilterPanelOpen}
                        onToggle={() => setIsFilterPanelOpen((prev) => !prev)}
                        onClose={() => setIsFilterPanelOpen(false)}
                        isTimeFilterActive={isTimeFilterActive}
                        onTimeFilterActiveChange={setIsTimeFilterActive}
                        timeSliderStep={timeSliderStep}
                        onTimeSliderStepChange={setTimeSliderStep}
                        priorityFilter={priorityFilter}
                        onPriorityFilterChange={setPriorityFilter}
                        priorityOptions={priorityOptions}
                        onReset={resetAdvancedFilters}
                    />
                    {unreadChangesCount > 0 && (
                        <button
                            type="button"
                            onClick={onNavigateToActivity}
                            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-red-100 border border-red-200 px-4 py-2 text-sm text-red-800 hover:bg-red-200 transition cursor-pointer"
                        >
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                                {unreadChangesCount}
                            </span>
                            <ShinyText
                                text="yeni değişiklik — Son Değişikliklere git"
                                speed={1.5}
                                color="#9a0000"
                                shineColor="#ff0000"
                                spread={120}
                                direction="left"
                                className="text-2xs font-black tracking-tight"
                            />
                        </button>
                    )}
                </div>
            </header>

            {isLoading && <div className="text-center p-12 text-slate-500">Veriler güncelleniyor...</div>}
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">Hata: {error}</div>}

            {!isLoading && !error && (
                projects.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400">Henüz hiç proje bulunamadı.</div>
                ) : (
                    viewMode === 'table'
                        ? (
                            <ProjectTable
                                projects={sortedProjects}
                                onRowClick={onRowClick}
                                sortKey={sortKey}
                                sortDirection={sortDirection}
                                onSort={onSort}
                            />
                        )
                        : <ProjectCards projects={sortedProjects} onCardClick={onRowClick} />
                )
            )}

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formAction={formAction}
                formState={formState}
                isPending={isPending}
            />
            <ImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={handleImport}
                isImporting={isImporting}
                result={importResult}
                error={importError}
            />
        </>
    );
}
