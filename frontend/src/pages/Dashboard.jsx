import React, { useState, useEffect, useActionState, useMemo, useRef } from 'react';
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
import { API_ROOT, apiFetch, getAuthHeaders, parseApiError } from '../utils/api';
import SplitText from "../components/dashboard/SplitText";
import RecentChangesTable from '../components/dashboard/RecentChangesTable';
import ShinyText from '../components/dashboard/ShinyText';
import { useNotification } from '../components/dashboard/useNotification';

const API_BASE = `${API_ROOT}/projects`;

function trimValue(value) {
    return String(value ?? '').trim();
}

async function fetchProjects({ skip = 0, limit = 500 } = {}) {
    const response = await apiFetch(`${API_BASE}/?skip=${skip}&limit=${limit}`, {
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

async function fetchAssignedProjects({ skip = 0, limit = 500 } = {}) {
    const response = await apiFetch(`${API_BASE}/assigned/me?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `${parseApiError(errorData.detail, 'Atanan projeler yüklenemedi.')}`,
        );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.items || []);
}

async function createProject(payload) {
    const response = await apiFetch(`${API_BASE}/`, {
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
    const response = await apiFetch(url, {
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

function collectAssignees(formData) {
    const assignedUserIds = formData
        .getAll('assigned_user_ids')
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);
    const assignedCustomNames = formData
        .getAll('assigned_custom_names')
        .map((value) => trimValue(value))
        .filter(Boolean);
    const sorumlular = trimValue(formData.get('sorumlular'));
    return { assignedUserIds, assignedCustomNames, sorumlular };
}

async function createProjectAction(prevState, formData) {
    const title = trimValue(formData.get('title'));
    const client = trimValue(formData.get('client'));
    const aksiyon = trimValue(formData.get('aksiyon'));
    const { assignedUserIds, assignedCustomNames, sorumlular } = collectAssignees(formData);

    if (!title) return { error: 'Proje başlığı zorunludur.', success: false };
    if (!client) return { error: 'Müşteri adı zorunludur.', success: false };
    if (!aksiyon) return { error: 'Aksiyon / sonraki adım zorunludur.', success: false };
    if (!sorumlular || (assignedUserIds.length === 0 && assignedCustomNames.length === 0)) {
        return { error: 'En az bir sorumlu kişi seçin veya özel isim ekleyin.', success: false };
    }

    const payload = {
        title,
        client,
        aksiyon,
        sorumlular,
        assigned_user_ids: assignedUserIds,
        assigned_custom_names: assignedCustomNames,
        durum: formData.get('durum') || 'BEKLEMEDE',
        tamamlanma: Number(trimValue(formData.get('tamamlanma')) || 0),
    };

    const oncelik = trimValue(formData.get('oncelik'));
    if (oncelik) payload.oncelik = Number(oncelik);

    for (const field of ['aciliyet', 'ilgili', 'beklenen', 'notlar', 'risk', 'ilgili_email', 'ilgili_telefon']) {
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
    const response = await apiFetch(`${API_BASE}/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errData.detail, 'Proje silinirken bir hata oluştu.'));
    }
}

async function updateProject(projectId, payload) {
    const response = await apiFetch(`${API_BASE}/${projectId}`, {
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
    const { assignedUserIds, assignedCustomNames, sorumlular } = collectAssignees(formData);

    if (!title) return { error: 'Proje başlığı zorunludur.', success: false };
    if (!client) return { error: 'Müşteri adı zorunludur.', success: false };
    if (!aksiyon) return { error: 'Aksiyon / sonraki adım zorunludur.', success: false };
    if (!sorumlular || (assignedUserIds.length === 0 && assignedCustomNames.length === 0)) {
        return { error: 'En az bir sorumlu kişi seçin veya özel isim ekleyin.', success: false };
    }

    const payload = {
        title,
        client,
        aksiyon,
        sorumlular,
        assigned_user_ids: assignedUserIds,
        assigned_custom_names: assignedCustomNames,
        durum: formData.get('durum') || 'BEKLEMEDE',
        tamamlanma: Number(trimValue(formData.get('tamamlanma')) || 0),
    };

    const oncelik = trimValue(formData.get('oncelik'));
    if (oncelik) payload.oncelik = Number(oncelik);

    for (const field of ['aciliyet', 'ilgili', 'beklenen', 'notlar', 'risk', 'ilgili_email', 'ilgili_telefon']) {
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

function Dashboard({ currentUser, onLogout }) {
    const [activeView, setActiveView] = useState('projects');
    const isAdmin = currentUser?.role === 'admin';
    const [projects, setProjects] = useState([]);
    const [assignedProjects, setAssignedProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssignedLoading, setIsAssignedLoading] = useState(false);
    const [error, setError] = useState(null);
    const [assignedError, setAssignedError] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formState, formAction, isPending] = useActionState(createProjectAction, { success: false, error: null });
    const [selectedProject, setSelectedProject] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [editState, editAction, isEditPending] = useActionState(updateProjectAction, { success: false, error: null });
    const wasCreatePendingRef = useRef(false);
    const wasEditPendingRef = useRef(false);
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
    const [recentChanges, setRecentChanges] = useState([]);
    const [changesLoading, setChangesLoading] = useState(false);
    const [changesError, setChangesError] = useState(null);
    const [unreadChangesCount, setUnreadChangesCount] = useState(0);
    const previousUnreadCountRef = useRef(null);
    const isUnreadNotificationReadyRef = useRef(false);

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

    async function loadAssignedProjects() {
        setIsAssignedLoading(true);
        try {
            const data = await fetchAssignedProjects();
            setAssignedProjects(data);
            setAssignedError(null);
        } catch (err) {
            console.error(err);
            setAssignedError(err.message);
        } finally {
            setIsAssignedLoading(false);
        }
    }

    async function markChangesViewed() {
        try {
            await apiFetch(`${API_ROOT}/projects/changes/mark-viewed`, {
                method: 'PATCH',
                headers: getAuthHeaders(null),
                cache: 'no-store',
            });
            setUnreadChangesCount(0);
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchUnreadChangesCount() {
        try {
            const response = await apiFetch(`${API_ROOT}/projects/changes/unread-count`, {
                method: 'GET',
                headers: getAuthHeaders(),
                cache: 'no-store',
            });

            if (!response.ok) return;

            const data = await response.json();
            setUnreadChangesCount(data.count ?? 0);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadRecentChanges() {
        setChangesLoading(true);
        setChangesError(null);
    
        try {
            const response = await apiFetch(`${API_ROOT}/projects/changes/recent?limit=30`, {
                method: 'GET',
                headers: getAuthHeaders(),
                cache: 'no-store',
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(parseApiError(errorData.detail, 'Değişiklikler yüklenemedi.'));
            }
    
            const data = await response.json();
            setRecentChanges(Array.isArray(data) ? data : []);
            await markChangesViewed();
        } catch (err) {
            setChangesError(err.message);
        } finally {
            setChangesLoading(false);
        }
    }

    useEffect(() => {
        if (activeView === 'users' && currentUser && !isAdmin) {
            setActiveView('projects');
        }
    }, [activeView, currentUser, isAdmin]);

    useEffect(() => {
        if (activeView === 'projects') {
            loadProjects();
        } else if (activeView === 'assigned') {
            loadAssignedProjects();
        }
    }, [activeView]);

    useEffect(() => {
        const wasPending = wasCreatePendingRef.current;
        wasCreatePendingRef.current = isPending;

        if (wasPending && !isPending && formState?.success && isModalOpen) {
            loadProjects();
            setIsModalOpen(false);
        }
    }, [formState?.success, isModalOpen, isPending]);

    useEffect(() => {
        const wasPending = wasEditPendingRef.current;
        wasEditPendingRef.current = isEditPending;

        if (wasPending && !isEditPending && editState?.success && editingProject) {
            loadProjects();
            loadAssignedProjects();
            setEditingProject(null);
        }
    }, [editState?.success, editingProject, isEditPending]);

    const priorityOptions = useMemo(() => getPriorityFilterOptions(projects), [projects]);

    useEffect(() => {
        const validValues = new Set(priorityOptions.map((option) => option.value));
        if (!validValues.has(priorityFilter)) {
            setPriorityFilter('TÜMÜ');
        }
    }, [priorityOptions, priorityFilter]);

    useEffect(() => {
        if (activeView === 'activity') {
            loadRecentChanges();
        }
    }, [activeView]);

    useEffect(() => {
        if (activeView !== 'projects') return undefined;

        fetchUnreadChangesCount();
        const interval = setInterval(fetchUnreadChangesCount, 30_000);
        return () => clearInterval(interval);
    }, [activeView]);

    const { triggerNotification } = useNotification();

    useEffect(() => {
        const previousCount = previousUnreadCountRef.current;

        if (!isUnreadNotificationReadyRef.current || previousCount === null) {
            previousUnreadCountRef.current = unreadChangesCount;
            isUnreadNotificationReadyRef.current = true;
            return;
        }

        if (unreadChangesCount > previousCount) {
            const newItems = unreadChangesCount - previousCount;
            const message = newItems === 1
                ? '1 yeni değişiklik eklendi.'
                : `${newItems} yeni değişiklik eklendi.`;

            triggerNotification('Proje Takip', {
                body: message,
                tag: 'project-changes',
                onClickAction: () => setActiveView('activity'),
            });
        }

        previousUnreadCountRef.current = unreadChangesCount;
    }, [unreadChangesCount, triggerNotification]);

    async function handleDeleteProject(project) {
        const confirmed = window.confirm(`"${project.title}" projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`);
        if (!confirmed) return;

        setIsDeleting(true);
        setDeleteError(null);

        try {
            await deleteProject(project.id);
            setSelectedProject(null);
            setProjects((prev) => prev.filter((p) => p.id !== project.id));
            setAssignedProjects((prev) => prev.filter((p) => p.id !== project.id));
            await loadProjects();
            await loadAssignedProjects();
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

    function sortProjects(list) {
        return [...list].sort((a, b) => {
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
    }

    const sortedProjects = sortProjects(filteredProjects);
    const sortedAssignedProjects = sortProjects(assignedProjects);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen((prev) => !prev)}
                currentUser={currentUser}
                activeView={activeView}
                onNavigate={setActiveView}
                isAdmin={isAdmin}
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
                ) : activeView === 'activity' ? (
                    <>
                        <header className="mb-8">
                            <h1 className="text-2xl font-black text-slate-800">
                            <SplitText
                                    text="Son Değişiklikler"
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
                            <p className="text-slate-500 mt-1">Sistemdeki son 30 proje hareketi</p>
                        </header>
                        <RecentChangesTable
                            changes={recentChanges}
                            isLoading={changesLoading}
                            error={changesError}
                        />
                    </>
                ) : activeView === 'assigned' ? (
                    <>
                        <header className="mb-8">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSidebarOpen(true)}
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

                        {isAssignedLoading && <div className="text-center p-12 text-slate-500">Veriler güncelleniyor...</div>}
                        {assignedError && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">Hata: {assignedError}</div>}

                        {!isAssignedLoading && !assignedError && (
                            assignedProjects.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400">Size atanmış proje bulunamadı.</div>
                            ) : (
                                <ProjectTable
                                    projects={sortedAssignedProjects}
                                    onRowClick={setSelectedProject}
                                    sortKey={sortKey}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                />
                            )
                        )}
                    </>
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
                                            strokeLinejoin="round"/>
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
                                onClick={() => setActiveView('activity')}
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
                            ? <ProjectTable 
                                projects={sortedProjects} 
                                onRowClick={setSelectedProject}
                                sortKey={sortKey} 
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                />
                            : <ProjectCards projects={sortedProjects} onCardClick={setSelectedProject}/>
                    )
                )}
                    </>
                )}
            </main>

            {(activeView === 'projects' || activeView === 'assigned') && (
                <>
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
                isAdmin={isAdmin}
            />
            <ProjectModal
                key={editingProject ? `edit-${editingProject.id}` : 'edit-none'}
                isOpen={!!editingProject}
                onClose={() => setEditingProject(null)}
                formAction={editAction}
                formState={editState}
                isPending={isEditPending}
                project={editingProject}
            />
                </>
            )}
            {activeView === 'projects' && (
                <>
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
            )}
        </div>
    );
}

export default Dashboard;
