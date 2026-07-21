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
import { useMachines } from '../features/machines/useMachines';
import { updateMachineAction } from '../features/machines/machineActions';
import { useAppointments } from '../features/appointments/useAppointments';
import { updateAppointmentAction } from '../features/appointments/appointmentActions';
import { useDashboardView } from '../hooks/useDashboardView';
import { VIEWS } from '../constants/views';
import MachinesView from '../features/machines/MachinesView';
import MachineModals from '../features/machines/MachineModals';
import AppointmentsView from '../features/appointments/AppointmentsView';
import AppointmentModals from '../features/appointments/AppointmentModals';

function Dashboard({ currentUser, onLogout }) {
    const { activeView, navigateToView } = useDashboardView();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [editingMachine, setEditingMachine] = useState(null);
    const [editingAppointment, setEditingAppointment] = useState(null);
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

    const {
        machines,
        isLoading: isMachinesLoading,
        error: machinesError,
        loadMachines,
        handleDeleteMachine,
        handleImport: handleMachineImport,
    } = useMachines(activeView);

    const {
        appointments,
        isLoading: isAppointmentsLoading,
        error: appointmentsError,
        loadAppointments,
        handleDeleteAppointment,
    } = useAppointments(activeView);

    const { sortKey, sortDirection, handleSort, applySort } = useProjectSort();

    const [editState, editAction, isEditPending] = useActionState(updateProjectAction, { success: false, error: null });
    const wasEditPendingRef = useRef(false);

    const [machineEditState, machineEditAction, isMachineEditPending] = useActionState(updateMachineAction, { success: false, error: null });
    const wasMachineEditPendingRef = useRef(false);

    const [appointmentEditState, appointmentEditAction, isAppointmentEditPending] = useActionState(updateAppointmentAction, { success: false, error: null });
    const wasAppointmentEditPendingRef = useRef(false);

    const navigateToActivity = useCallback(() => navigateToView(VIEWS.ACTIVITY), [navigateToView]);

    const {
        recentChanges,
        changesLoading,
        changesError,
        unreadChangesCount,
    } = useRecentChanges(activeView, navigateToActivity);

    useEffect(() => {
        if (
            (activeView === VIEWS.USERS)
            && currentUser
            && !isAdmin
        ) {
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

    useEffect(() => {
        const wasPending = wasMachineEditPendingRef.current;
        wasMachineEditPendingRef.current = isMachineEditPending;

        if (wasPending && !isMachineEditPending && machineEditState?.success && editingMachine) {
            loadMachines();
            setEditingMachine(null);
        }
    }, [machineEditState?.success, editingMachine, isMachineEditPending, loadMachines]);

    useEffect(() => {
        const wasPending = wasAppointmentEditPendingRef.current;
        wasAppointmentEditPendingRef.current = isAppointmentEditPending;

        if (wasPending && !isAppointmentEditPending && appointmentEditState?.success && editingAppointment) {
            loadAppointments();
            setEditingAppointment(null);
        }
    }, [appointmentEditState?.success, editingAppointment, isAppointmentEditPending, loadAppointments]);

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

    async function onDeleteMachine(machine) {
        const confirmed = window.confirm(
            `"${machine.ocak}" makinesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
        );
        if (!confirmed) return;

        setIsDeleting(true);
        setDeleteError(null);

        const result = await handleDeleteMachine(machine);

        if (result.success) {
            setSelectedMachine(null);
        } else if (result.error) {
            setDeleteError(result.error);
        }

        setIsDeleting(false);
    }

    async function onDeleteAppointment(appointment) {
        const confirmed = window.confirm(
            `"${appointment.title}" randevusunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
        );
        if (!confirmed) return;

        setIsDeleting(true);
        setDeleteError(null);

        const result = await handleDeleteAppointment(appointment);

        if (result.success) {
            setSelectedAppointment(null);
        } else if (result.error) {
            setDeleteError(result.error);
        }

        setIsDeleting(false);
    }

    const showProjectModals = activeView === VIEWS.PROJECTS || activeView === VIEWS.ASSIGNED;
    const showMachineModals = activeView === VIEWS.MACHINES;
    const showAppointmentModals = activeView === VIEWS.APPOINTMENTS;

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
                {activeView === VIEWS.MACHINES && (
                    <MachinesView
                        machines={machines}
                        isLoading={isMachinesLoading}
                        error={machinesError}
                        onReload={loadMachines}
                        onImport={handleMachineImport}
                        onCardClick={setSelectedMachine}
                        onOpenSidebar={() => setIsSidebarOpen(true)}
                    />
                )}
                {activeView === VIEWS.APPOINTMENTS && (
                    <AppointmentsView
                        appointments={appointments}
                        isLoading={isAppointmentsLoading}
                        error={appointmentsError}
                        onReload={loadAppointments}
                        onOpenSidebar={() => setIsSidebarOpen(true)}
                        onAppointmentClick={setSelectedAppointment}
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
                    currentUser={currentUser}
                />
            )}
            {showMachineModals && (
                <MachineModals
                    selectedMachine={selectedMachine}
                    onCloseDetail={() => {
                        setSelectedMachine(null);
                        setDeleteError(null);
                    }}
                    onEditClick={(machine) => {
                        setSelectedMachine(null);
                        setEditingMachine(machine);
                        setDeleteError(null);
                    }}
                    onDelete={onDeleteMachine}
                    isDeleting={isDeleting}
                    deleteError={deleteError}
                    isAdmin={isAdmin}
                    editingMachine={editingMachine}
                    onCloseEdit={() => setEditingMachine(null)}
                    editAction={machineEditAction}
                    editState={machineEditState}
                    isEditPending={isMachineEditPending}
                />
            )}
            {showAppointmentModals && (
                <AppointmentModals
                    selectedAppointment={selectedAppointment}
                    onCloseDetail={() => {
                        setSelectedAppointment(null);
                        setDeleteError(null);
                    }}
                    onEditClick={(appointment) => {
                        setSelectedAppointment(null);
                        setEditingAppointment(appointment);
                        setDeleteError(null);
                    }}
                    onDelete={onDeleteAppointment}
                    isDeleting={isDeleting}
                    deleteError={deleteError}
                    editingAppointment={editingAppointment}
                    onCloseEdit={() => setEditingAppointment(null)}
                    editAction={appointmentEditAction}
                    editState={appointmentEditState}
                    isEditPending={isAppointmentEditPending}
                />
            )}
        </div>
    );
}

export default Dashboard;
