import MachineDetailModal from '../../components/dashboard/MachineDetailModal';
import MachineModal from '../../components/dashboard/MachineModal';

export default function MachineModals({
    selectedMachine,
    onCloseDetail,
    onEditClick,
    onDelete,
    isDeleting,
    deleteError,
    isAdmin,
    editingMachine,
    onCloseEdit,
    editAction,
    editState,
    isEditPending,
}) {
    return (
        <>
            <MachineDetailModal
                machine={selectedMachine}
                onClose={onCloseDetail}
                onEditClick={onEditClick}
                onDelete={onDelete}
                isDeleting={isDeleting}
                deleteError={deleteError}
                isAdmin={isAdmin}
            />
            <MachineModal
                key={editingMachine ? `edit-${editingMachine.id}` : 'edit-none'}
                isOpen={!!editingMachine}
                onClose={onCloseEdit}
                formAction={editAction}
                formState={editState}
                isPending={isEditPending}
                machine={editingMachine}
            />
        </>
    );
}
