import { useState, useEffect, useActionState, useRef, useCallback } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import UserManagement from '../components/dashboard/UserManagement';
import ProjectsView from '../features/projects/ProjectsView';
import AssignedView from '../features/projects/AssignedView';
import ActivityView from '../features/activity/ActivityView';
import ProjectModals from '../features/projects/ProjectModals';
import { updateProjectAction } from '../features/projects/projectActions';
import { useProjects } from '../features/projects/useProjects';
import { useProjectSort } from '../features/projects/useProjectFilters';
import { useRecentChanges } from '../features/activity/useRecentChanges';
import { useDashboardView } from '../hooks/useDashboardView';
import { VIEWS } from '../constants/views';

function Dashboard({ currentUser, onLogout }) {
    const { activeView, navigateToView } = useDashboardView();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const isAdmin = currentUser?.role === 'admin';

    const {
        projects,
        assignedProjects,
        isLoading,
        isAssignedLoading,
        error,
        assignedError,
        loadProjects,
        reloadAll,
        handleDeleteProject,
        handleImport,
    } = useProjects(activeView);

    const { sortKey, sortDirection, handleSort, applySort } = useProjectSort();

    const [editState, editAction, isEditPending] = useActionState(updateProjectAction, { success: false, error: null });
    const wasEditPendingRef = useRef(false);

    const navigateToActivity = useCallback(() => navigateToView(VIEWS.ACTIVITY), [navigateToView]);

    const {
        recentChanges,
        changesLoading,
        changesError,
        unreadChangesCount,
    } = useRecentChanges(activeView, navigateToActivity);

    useEffect(() => {
        if (activeView === VIEWS.USERS && currentUser && !isAdmin) {
            navigateToView(VIEWS.PROJECTS, { replace: true });
        }
    }, [activeView, currentUser, isAdmin, navigateToView]);

    useEffect(() => {
        const wasPending = wasEditPendingRef.current;
        wasEditPendingRef.current = isEditPending;

        if (wasPending && !isEditPending && editState?.success && editingProject) {
            reloadAll();
            setEditingProject(null);
        }
    }, [editState?.success, editingProject, isEditPending, reloadAll]);

    async function onDeleteProject(project) {
        const confirmed = window.confirm(
            `"${project.title}" projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
        );
        if (!confirmed) return;

        setIsDeleting(true);
        setDeleteError(null);

        const result = await handleDeleteProject(project);

        if (result.success) {
            setSelectedProject(null);
        } else if (result.error) {
            setDeleteError(result.error);
        }

        setIsDeleting(false);
    }

    const showProjectModals = activeView === VIEWS.PROJECTS || activeView === VIEWS.ASSIGNED;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen((prev) => !prev)}
                currentUser={currentUser}
                activeView={activeView}
                onNavigate={navigateToView}
                isAdmin={isAdmin}
            />

            <div
                className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'w-64' : 'w-18'
                }`}
                aria-hidden="true"
            />

            <main className="flex-1 min-w-0 p-6 md:p-10 overflow-x-hidden">
                {activeView === VIEWS.USERS && (
                    <UserManagement currentUser={currentUser} />
                )}
                {activeView === VIEWS.ACTIVITY && (
                    <ActivityView
                        changes={recentChanges}
                        isLoading={changesLoading}
                        error={changesError}
                    />
                )}
                {activeView === VIEWS.ASSIGNED && (
                    <AssignedView
                        projects={assignedProjects}
                        isLoading={isAssignedLoading}
                        error={assignedError}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        applySort={applySort}
                        onRowClick={setSelectedProject}
                        onOpenSidebar={() => setIsSidebarOpen(true)}
                    />
                )}
                {activeView === VIEWS.PROJECTS && (
                    <ProjectsView
                        projects={projects}
                        isLoading={isLoading}
                        error={error}
                        onReload={loadProjects}
                        onImport={handleImport}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        applySort={applySort}
                        onRowClick={setSelectedProject}
                        onOpenSidebar={() => setIsSidebarOpen(true)}
                        unreadChangesCount={unreadChangesCount}
                        onNavigateToActivity={navigateToActivity}
                    />
                )}
            </main>

            {showProjectModals && (
                <ProjectModals
                    selectedProject={selectedProject}
                    onCloseDetail={() => {
                        setSelectedProject(null);
                        setDeleteError(null);
                    }}
                    onEditClick={(proj) => {
                        setSelectedProject(null);
                        setEditingProject(proj);
                        setDeleteError(null);
                    }}
                    onDelete={onDeleteProject}
                    isDeleting={isDeleting}
                    deleteError={deleteError}
                    isAdmin={isAdmin}
                    editingProject={editingProject}
                    onCloseEdit={() => setEditingProject(null)}
                    editAction={editAction}
                    editState={editState}
                    isEditPending={isEditPending}
                />
            )}
        </div>
    );
}

export default Dashboard;
