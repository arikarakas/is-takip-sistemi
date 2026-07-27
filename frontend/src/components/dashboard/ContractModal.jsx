import { LABEL_CLASS_NAME } from '../../constants/projects';

const INPUT_CLASS =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500';

function ContractModal({
    isOpen,
    onClose,
    formAction,
    formState,
    isPending,
    contract = null,
    onDelete,
    isDeleting = false,
    deleteError = null,
}) {
    if (!isOpen) return null;

    const isEditMode = !!contract;
    const startDate = contract?.start_date ? String(contract.start_date).split('T')[0] : '';
    const endDate = contract?.end_date ? String(contract.end_date).split('T')[0] : '';

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-6 pb-4 shrink-0">
                    <h3 className="text-lg font-black text-slate-800">
                        {isEditMode ? 'Sözleşme Bilgilerini Düzenle' : 'Yeni Firma / Sözleşme Ekle'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-xl"
                    >
                        ✕
                    </button>
                </header>

                <div className="overflow-y-auto px-6 pb-6">
                    {formState?.error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium">
                            {formState.error}
                        </div>
                    )}

                    <form action={formAction} className="space-y-4" autoComplete="off">
                        {isEditMode && <input type="hidden" name="contractId" value={contract.id} />}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={LABEL_CLASS_NAME}>Firma Adı *</label>
                                <input
                                    name="company_name"
                                    type="text"
                                    required
                                    defaultValue={contract?.company_name || ''}
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>Bakım Adedi</label>
                                <input
                                    name="maintenance_count"
                                    type="number"
                                    min="1"
                                    defaultValue={contract?.maintenance_count ?? 1}
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>Bakım Dönemi</label>
                                <input
                                    name="period_type"
                                    type="text"
                                    placeholder="Örn: 3AYDA1"
                                    defaultValue={contract?.period_type || ''}
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>Başlangıç Tarihi</label>
                                <input
                                    name="start_date"
                                    type="date"
                                    defaultValue={startDate}
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>Bitiş Tarihi</label>
                                <input
                                    name="end_date"
                                    type="date"
                                    defaultValue={endDate}
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>Sözleşme Bedeli (TL)</label>
                                <input
                                    name="total_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={contract?.total_amount ?? 0}
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>Dönem Vadesi</label>
                                <input
                                    name="payment_term"
                                    type="text"
                                    placeholder="Örn: 30 GÜN"
                                    defaultValue={contract?.payment_term || ''}
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={LABEL_CLASS_NAME}>Dönem Bedeli (TL)</label>
                                <input
                                    name="period_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={contract?.period_amount ?? 0}
                                    className={INPUT_CLASS}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            {isEditMode && onDelete && (
                                <div className="pb-1 border-b border-slate-100">
                                    {deleteError && (
                                        <p className="text-xs text-red-600 mb-3">{deleteError}</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onDelete(contract)}
                                        disabled={isDeleting || isPending}
                                        className="px-4 py-2.5 text-red-600 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? 'Siliniyor...' : 'Sözleşmeyi Sil'}
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 rounded-xl bg-slate-100 text-slate-600 py-3 text-sm font-semibold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending || isDeleting}
                                    className="flex-1 rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
                                >
                                    {isPending
                                        ? 'Kaydediliyor...'
                                        : isEditMode
                                            ? 'Değişiklikleri Kaydet'
                                            : 'Sözleşmeyi Ekle'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ContractModal;
