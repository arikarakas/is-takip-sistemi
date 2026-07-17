import {
    LABEL_CLASS_NAME,
    MACHINE_STATUS_OPTIONS,
} from '../../constants/projects';

function MachineModal({ isOpen, onClose, formAction, formState, isPending, machine = null }) {
    if (!isOpen) return null;

    const isEditMode = !!machine;

    const rawDateBakim = machine?.bakim_tarih ? String(machine.bakim_tarih).split('T')[0] : '';
    const rawDateHalat = machine?.halat_degisim_tarih ? String(machine.halat_degisim_tarih).split('T')[0] : '';
    const bakimDefault = machine?.bakim ? 'true' : 'false';
    const halatBoyu = /^\d{4}-\d{2}-\d{2}$/.test(machine?.halat_boyu || '') ? '' : (machine?.halat_boyu || '');

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-6 pb-4 shrink-0">
                    <h3 className="text-lg font-black text-slate-800">
                        {isEditMode ? 'Makine Bilgilerini Düzenle' : 'Yeni Makine Ekle'}
                    </h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-xl">✕</button>
                </header>

                <div className="overflow-y-auto px-6 pb-6">
                    {formState?.error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium">
                            {formState.error}
                        </div>
                    )}

                    <form action={formAction} className="space-y-4" autoComplete="off">
                        {isEditMode && <input type="hidden" name="machineId" value={machine.id} />}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={LABEL_CLASS_NAME}>BİNA ADI *</label>
                                <input
                                    name="ocak"
                                    type="text"
                                    required
                                    defaultValue={machine?.ocak || ''}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>BAKIMI YAPILDI MI</label>
                                <select
                                    name="bakim"
                                    defaultValue={bakimDefault}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500"
                                >
                                    {MACHINE_STATUS_OPTIONS.map((option) => (
                                        <option key={String(option.value)} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>MARKA</label>
                                <input
                                    name="marka"
                                    type="text"
                                    defaultValue={machine?.marka || ''}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={LABEL_CLASS_NAME}>MAKİNE TİPİ</label>
                                <textarea
                                    name="tip"
                                    defaultValue={machine?.tip || ''}
                                    className="w-full rounded-xl border field-sizing-content min-h-15 border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>HALAT BOYU</label>
                                {/* name bilerek halat_boyu değil: tarayıcı bunu tarih alanıyla karıştırıyor */}
                                <input
                                    name="rope_length"
                                    type="text"
                                    defaultValue={halatBoyu}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>GIND MANUEL KOD</label>
                                <input
                                    name="manuel_kod"
                                    type="text"
                                    defaultValue={machine?.manuel_kod || ''}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>SON BAKIM TARİHİ</label>
                                <input
                                    name="bakim_tarih"
                                    type="date"
                                    defaultValue={rawDateBakim}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>SON HALAT DEĞİŞİM TARİHİ</label>
                                <input
                                    name="halat_degisim_tarih"
                                    type="date"
                                    defaultValue={rawDateHalat}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-slate-100 text-slate-600 py-3 text-sm font-semibold hover:bg-slate-200 transition cursor-pointer">Vazgeç</button>
                            <button type="submit" disabled={isPending} className="flex-1 rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 shadow-sm transition disabled:opacity-50 cursor-pointer">
                                {isPending ? 'Kaydediliyor...' : isEditMode ? 'Değişiklikleri Kaydet' : 'Makineyi Ekle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MachineModal;
