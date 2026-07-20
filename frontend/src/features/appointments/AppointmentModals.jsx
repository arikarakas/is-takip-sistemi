import AppointmentDetailModal from '../../components/dashboard/AppointmentDetailModal';
import AppointmentModal from '../../components/dashboard/AppointmentModal';

export default function AppointmentModals({
    selectedAppointment,
    onCloseDetail,
    onEditClick,
    onDelete,
    isDeleting,
    deleteError,
    editingAppointment,
    onCloseEdit,
    editAction,
    editState,
    isEditPending,
}) {
    return (
        <>
            <AppointmentDetailModal
                appointment={selectedAppointment}
                onClose={onCloseDetail}
                onEditClick={onEditClick}
                onDelete={onDelete}
                isDeleting={isDeleting}
                deleteError={deleteError}
            />
            <AppointmentModal
                key={editingAppointment ? `edit-${editingAppointment.id}` : 'edit-none'}
                isOpen={!!editingAppointment}
                onClose={onCloseEdit}
                formAction={editAction}
                formState={editState}
                isPending={isEditPending}
                appointment={editingAppointment}
            />
        </>
    );
}
