import ProjectDetailModal from '../../components/dashboard/ProjectDetailModal';
import ProjectModal from '../../components/dashboard/ProjectModal';

export default function ProjectModals({
    selectedProject,
    onCloseDetail,
    onEditClick,
    onDelete,
    isDeleting,
    deleteError,
    isAdmin,
    editingProject,
    onCloseEdit,
    editAction,
    editState,
    isEditPending,
}) {
    return (
        <>
            <ProjectDetailModal
                project={selectedProject}
                onClose={onCloseDetail}
                onEditClick={onEditClick}
                onDelete={onDelete}
                isDeleting={isDeleting}
                deleteError={deleteError}
                isAdmin={isAdmin}
            />
            <ProjectModal
                key={editingProject ? `edit-${editingProject.id}` : 'edit-none'}
                isOpen={!!editingProject}
                onClose={onCloseEdit}
                formAction={editAction}
                formState={editState}
                isPending={isEditPending}
                project={editingProject}
            />
        </>
    );
}
