import { MenuIcon } from '../../components/dashboard/Sidebar';
import ProjectTable from '../../components/dashboard/ProjectTable';
import SplitText from '../../components/dashboard/SplitText';

export default function AssignedView({
    projects,
    isLoading,
    error,
    sortKey,
    sortDirection,
    onSort,
    applySort,
    onRowClick,
    onOpenSidebar,
}) {
    const sortedProjects = applySort(projects);

    return (
        <>
            <header className="mb-8">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenSidebar}
                        className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                        aria-label="Menüyü aç"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            <SplitText
                                text="Bana Atananlar"
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
                        <p className="text-slate-500 mt-1">Size atanmış işler</p>
                    </div>
                </div>
            </header>

            {isLoading && <div className="text-center p-12 text-slate-500">Veriler güncelleniyor...</div>}
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">Hata: {error}</div>}

            {!isLoading && !error && (
                projects.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400">Size atanmış proje bulunamadı.</div>
                ) : (
                    <ProjectTable
                        projects={sortedProjects}
                        onRowClick={onRowClick}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        onSort={onSort}
                    />
                )
            )}
        </>
    );
}
