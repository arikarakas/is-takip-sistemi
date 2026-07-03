import React, { useState, useEffect, useActionState, useMemo } from 'react';
import Sidebar, { MenuIcon } from '../components/dashboard/Sidebar';
import ProjectTable from '../components/dashboard/ProjectTable';
import ProjectCards from '../components/dashboard/ProjectCards';
import ProjectModal from '../components/dashboard/ProjectModal';
import ProjectDetailModal from '../components/dashboard/ProjectDetailModal';
import ImportModal from '../components/dashboard/ImportModal';
import FilterPanel from '../components/dashboard/FilterPanel';
import UserManagement from '../components/dashboard/UserManagement';
import { ACILIYET_DEGERI } from '../constants/projects';
import { matchesTimeFilter, matchesPriorityFilter, getPriorityFilterOptions } from '../utils/projectFilters';
import { API_ROOT, fetchCurrentUser, getAuthHeaders, parseApiError } from '../utils/api';
import SplitText from "../components/dashboard/SplitText";

const API_BASE = `${API_ROOT}/projects`;

function trimValue(value) {
    return String(value ?? '').trim();
}

async function fetchProjects({ skip = 0, limit = 500 } = {}) {
    const response = await fetch(`${API_BASE}/?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `${parseApiError(errorData.detail, 'Yetkisiz veya Geçersiz İstek')}`,
        );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.items || []);
}

async function createProject(payload) {
    const response = await fetch(`${API_BASE}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Proje eklenirken bir hata oluştu.'));
    }

    return response.json();
}

async function importProjects(formData) {
    const file = formData.get('file');
    const headerRow = String(formData.get('header_row') ?? '').trim();

    const body = new FormData();
    body.append('file', file);

    let url = `${API_BASE}/import`;
    if (headerRow) {
        url += `?header_row=${encodeURIComponent(headerRow)}`;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'İçe aktarma sırasında bir hata oluştu.'));
    }

    return response.json();
}

async function createProjectAction(prevState, formData) {
    const title = trimValue(formData.get('title'));
    const client = trimValue(formData.get('client'));
    const aksiyon = trimValue(formData.get('aksiyon'));
    const sorumlular = trimValue(formData.get('sorumlular'));

    if (!title) return { error: 'Proje başlığı zorunludur.', success: false };
    if (!client) return { error: 'Müşteri adı zorunludur.', success: false };
    if (!aksiyon) return { error: 'Aksiyon / sonraki adım zorunludur.', success: false };
    if (!sorumlular) return { error: 'Sorumlu kişi(ler) zorunludur.', success: false };

    const payload = {
        title,
        client,
        aksiyon,
        sorumlular,
        durum: formData.get('durum') || 'BEKLEMEDE',
        tamamlanma: Number(trimValue(formData.get('tamamlanma')) || 0),
    };

    const oncelik = trimValue(formData.get('oncelik'));
    if (oncelik) payload.oncelik = Number(oncelik);

    for (const field of ['aciliyet', 'ilgili', 'beklenen', 'notlar', 'risk']) {
        const value = trimValue(formData.get(field));
        if (value) payload[field] = value;
    }

    const hedefTarih = trimValue(formData.get('hedef_tarih'));
    if (hedefTarih) payload.hedef_tarih = hedefTarih;

    try {
        await createProject(payload);
        return { success: true, error: null };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}

async function deleteProject(projectId) {
    const response = await fetch(`${API_BASE}/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Proje silinirken bir hata oluştu.'));
    }
}

async function updateProject(projectId, payload) {
    const response = await fetch(`${API_BASE}/${projectId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Proje güncellenirken bir hata oluştu.'));
    }

    return response.json();
}

async function updateProjectAction(prevState, formData) {
    const projectId = formData.get('projectId');
    const title = trimValue(formData.get('title'));
    const client = trimValue(formData.get('client'));
    const aksiyon = trimValue(formData.get('aksiyon'));
    const sorumlular = trimValue(formData.get('sorumlular'));

    if (!title) return { error: 'Proje başlığı zorunludur.', success: false };
    if (!client) return { error: 'Müşteri adı zorunludur.', success: false };
    if (!aksiyon) return { error: 'Aksiyon / sonraki adım zorunludur.', success: false };
    if (!sorumlular) return { error: 'Sorumlu kişi(ler) zorunludur.', success: false };

    const payload = {
        title,
        client,
        aksiyon,
        sorumlular,
        durum: formData.get('durum') || 'BEKLEMEDE',
        tamamlanma: Number(trimValue(formData.get('tamamlanma')) || 0),
    };

    const oncelik = trimValue(formData.get('oncelik'));
    if (oncelik) payload.oncelik = Number(oncelik);

    for (const field of ['aciliyet', 'ilgili', 'beklenen', 'notlar', 'risk']) {
        const value = trimValue(formData.get(field));
        if (value) payload[field] = value;
    }

    const hedefTarih = trimValue(formData.get('hedef_tarih'));
    if (hedefTarih) payload.hedef_tarih = hedefTarih;

    try {
        await updateProject(projectId, payload);
        return { success: true, error: null, isEdit: true };
    } catch (err) {
        return { error: err.message || 'Sunucu bağlantı hatası.', success: false };
    }
}

function Dashboard({ onLogout }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeView, setActiveView] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formState, formAction, isPending] = useActionState(createProjectAction, { success: false, error: null });
    const [selectedProject, setSelectedProject] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [editState, editAction, isEditPending] = useActionState(updateProjectAction, { success: false, error: null });
    const [lastSubmittedAt, setLastSubmittedAt] = useState(0);
    const [lastEditSubmittedAt, setLastEditSubmittedAt] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [importError, setImportError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('HEPSİ');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isTimeFilterActive, setIsTimeFilterActive] = useState(false);
    const [timeSliderStep, setTimeSliderStep] = useState(2);
    const [priorityFilter, setPriorityFilter] = useState('TÜMÜ');

    async function loadProjects() {
        try {
            const data = await fetchProjects();
            setProjects(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchCurrentUser()
            .then(setCurrentUser)
            .catch((err) => {
                console.error(err);
                onLogout();
            });
    }, [onLogout]);

    useEffect(() => {
        if (activeView === 'users' && currentUser && currentUser.role !== 'admin') {
            setActiveView('projects');
        }
    }, [activeView, currentUser]);

    useEffect(() => {
        if (activeView === 'projects') {
            loadProjects();
        }
    }, [activeView]);

    useEffect(() => {
        if (formState?.success && isModalOpen && lastSubmittedAt > 0) {
            loadProjects();
            setIsModalOpen(false);
            setLastSubmittedAt(0);
        }
    }, [formState?.success, isModalOpen, lastSubmittedAt]);

    useEffect(() => {
        if (editState?.success && editingProject && lastEditSubmittedAt > 0) {
            loadProjects();
            setEditingProject(null);
            setLastEditSubmittedAt(0);
        }
    }, [editState?.success, editingProject, lastEditSubmittedAt]);

    const priorityOptions = useMemo(() => getPriorityFilterOptions(projects), [projects]);

    useEffect(() => {
        const validValues = new Set(priorityOptions.map((option) => option.value));
        if (!validValues.has(priorityFilter)) {
            setPriorityFilter('TÜMÜ');
        }
    }, [priorityOptions, priorityFilter]);

    async function handleDeleteProject(project) {
        const confirmed = window.confirm(`"${project.title}" projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`);
        if (!confirmed) return;

        setIsDeleting(true);
        setDeleteError(null);

        try {
            await deleteProject(project.id);
            setSelectedProject(null);
            setProjects((prev) => prev.filter((p) => p.id !== project.id));
            await loadProjects();
        } catch (err) {
            setDeleteError(err.message);
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleImport(formData) {
        setIsImporting(true);
        setImportError(null);
        setImportResult(null);

        try {
            const result = await importProjects(formData);
            setImportResult(result);
            await loadProjects();
        } catch (err) {
            setImportError(err.message);
        } finally {
            setIsImporting(false);
        }
    }

    const statusFiltered = projects.filter((project) => {
        if (statusFilter === 'HEPSİ') return true;

        const projStatus = (project.durum || '').trim().toLocaleUpperCase('tr-TR');
        return projStatus === statusFilter.toLocaleUpperCase('tr-TR');
    });
    
    const filteredProjects = statusFiltered.filter((project) => {
        const searchString = searchTerm.toLowerCase();
        const matchesSearch = (
            (project.title || '').toLowerCase().includes(searchString) ||
            (project.client || '').toLowerCase().includes(searchString) ||
            (project.sorumlular || '').toLowerCase().includes(searchString) ||
            (project.ilgili || '').toLowerCase().includes(searchString)
        );

        if (!matchesSearch) return false;
        if (isTimeFilterActive && !matchesTimeFilter(project.hedef_tarih, timeSliderStep)) return false;
        if (!matchesPriorityFilter(project.oncelik, priorityFilter)) return false;

        return true;
    });

    function resetAdvancedFilters() {
        setIsTimeFilterActive(false);
        setTimeSliderStep(2);
        setPriorityFilter('TÜMÜ');
    }

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (!sortKey) return 0;

        let valA = a[sortKey];
        let valB = b[sortKey];

        if (valA == null || valA === '') return 1;
        if (valB == null || valB === '') return -1;

        let result = 0;

        if (sortKey === 'aciliyet') {
            const dA = ACILIYET_DEGERI[valA] ?? 0;
            const dB = ACILIYET_DEGERI[valB] ?? 0;
            result = sortDirection === 'asc' ? dA - dB : dB - dA;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
            result = sortDirection === 'asc'
                ? valA.localeCompare(valB, 'tr')
                : valB.localeCompare(valA, 'tr');
        } else if (valA > valB) {
            result = sortDirection === 'asc' ? 1 : -1;
        } else if (valA < valB) {
            result = sortDirection === 'asc' ? -1 : 1;
        }

        if (result !== 0) return result;

        if (sortKey === 'aciliyet') return 0;

        const siraA = a.sira ?? Infinity;
        const siraB = b.sira ?? Infinity;
        return siraA - siraB;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen((prev) => !prev)}
                currentUser={currentUser}
                activeView={activeView}
                onNavigate={setActiveView}
                isAdmin={currentUser?.role === 'admin'}
            />

            <div
                className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'w-64' : 'w-18'
                }`}
                aria-hidden="true"
            />

            <main className="flex-1 min-w-0 p-6 md:p-10 overflow-x-hidden">
                {activeView === 'users' ? (
                    <UserManagement currentUser={currentUser} />
                ) : (
                    <>
                <header className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                                aria-label="Menüyü aç"
                            >
                                <MenuIcon className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                                <SplitText
                                    text="Tüm Projeler ve İşler"
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
                                İçe Aktar
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
                    </div>
                </header>

                {isLoading && <div className="text-center p-12 text-slate-500">Veriler güncelleniyor...</div>}
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">Hata: {error}</div>}

                {!isLoading && !error && (
                    projects.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400">Henüz hiç proje bulunamadı.</div>
                    ) : (
                        viewMode === 'table'
                            ? <ProjectTable 
                                projects={sortedProjects} 
                                onRowClick={setSelectedProject} 
                                sortKey={sortKey} 
                                sortDirection={sortDirection}
                                onSort={(key) => {
                                    if (sortKey === key) {
                                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                    } else {
                                        setSortKey(key);
                                        setSortDirection('asc');
                                    }
                                }}
                                />
                            : <ProjectCards projects={sortedProjects} onCardClick={setSelectedProject}/>
                    )
                )}
                    </>
                )}
            </main>

            {activeView === 'projects' && (
                <>
            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formAction={formAction}
                formState={formState}
                isPending={isPending}
                onSubmit={() => setLastSubmittedAt(Date.now())}
            />
            <ProjectModal
                key={editingProject ? `edit-${editingProject.id}` : 'edit-none'}
                isOpen={!!editingProject}
                onClose={() => setEditingProject(null)}
                formAction={editAction}
                formState={editState}
                isPending={isEditPending}
                project={editingProject}
                onSubmit={() => setLastEditSubmittedAt(Date.now())}
            />
            <ImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={handleImport}
                isImporting={isImporting}
                result={importResult}
                error={importError}
            />
            <ProjectDetailModal 
                project={selectedProject}
                onClose={() => {
                    setSelectedProject(null);
                    setDeleteError(null);
                }}
                onEditClick={(proj) => {
                    setSelectedProject(null);
                    setEditingProject(proj);
                    setDeleteError(null);
                }}
                onDelete={handleDeleteProject}
                isDeleting={isDeleting}
                deleteError={deleteError}
            />
                </>
            )}
        </div>
    );
}

export default Dashboard;
