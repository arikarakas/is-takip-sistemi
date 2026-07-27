import ContractModal from '../../components/dashboard/ContractModal';

export default function MaintenanceContractModals({
    editingContract,
    onCloseEdit,
    editAction,
    editState,
    isEditPending,
    onDelete,
    isDeleting,
    deleteError,
}) {
    return (
        <ContractModal
            key={editingContract ? `edit-${editingContract.id}` : 'edit-none'}
            isOpen={!!editingContract}
            onClose={onCloseEdit}
            formAction={editAction}
            formState={editState}
            isPending={isEditPending}
            contract={editingContract}
            onDelete={onDelete}
            isDeleting={isDeleting}
            deleteError={deleteError}
        />
    );
}
