import {
    LABEL_CLASS_NAME,
    PROJECT_STATUS_OPTIONS,
    PROJECT_URGENCY_OPTIONS,
} from '../../constants/projects';
import AssigneeMultiSelect from './AssigneeMultiSelect';

function ProjectModal({ isOpen, onClose, formAction, formState, isPending, project = null }) {
    if (!isOpen) return null;

    const isEditMode = !!project;

    const rawDate = project?.hedef_tarih ? String(project.hedef_tarih).split('T')[0] : '';

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-6 pb-4 shrink-0">
                    <h3 className="text-lg font-black text-slate-800">
                        {isEditMode ? 'Proje / İş Bilgilerini Düzenle' : 'Yeni Proje / İş Ekle'}
                    </h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-xl">✕</button>
                </header>

                <div className="overflow-y-auto px-6 pb-6">
                    {formState?.error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium">
                            {formState.error}
                        </div>
                    )}

                    <form action={formAction} className="space-y-4">
                        {isEditMode && <input type="hidden" name="projectId" value={project.id} />}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={LABEL_CLASS_NAME}>PROJE BAŞLIĞI *</label>
                                <input name="title" type="text" defaultValue={project?.title || ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500" />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>PROJE / MÜŞTERİ *</label>
                                <input name="client" type="text" defaultValue={project?.client || ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500" />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>DURUM</label>
                                <select name="durum" defaultValue={project?.durum || 'BEKLEMEDE'} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500">
                                    {PROJECT_STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className={LABEL_CLASS_NAME}>AKSİYON / SONRAKİ ADIM *</label>
                                <textarea name="aksiyon" rows="3" defaultValue={project?.aksiyon || ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500 resize-none" />
                            </div>

                            <AssigneeMultiSelect
                                key={isEditMode ? `assignees-${project.id}` : 'assignees-new'}
                                initialAssignments={project?.assignments || []}
                                fallbackSorumlular={project?.sorumlular || ''}
                            />

                            <div>
                                <label className={LABEL_CLASS_NAME}>İLGİLİ KİŞİ</label>
                                <input name="ilgili" type="text" defaultValue={project?.ilgili || ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500" />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>İLGİLİ KİŞİ E-MAIL</label>
                                <input name="ilgili_email" type="text" defaultValue={project?.ilgili_email || ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500" />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>İLGİLİ KİŞİ TELEFON</label>
                                <input name="ilgili_telefon" type="text" defaultValue={project?.ilgili_telefon || ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500" />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>ÖNCELİK</label>
                                <input name="oncelik" type="number" min="1" placeholder="Örn: 1" defaultValue={project?.oncelik || ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500" />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>ACİLİYET</label>
                                <select name="aciliyet" defaultValue={project?.aciliyet || 'Normal'} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500">
                                    {PROJECT_URGENCY_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>HEDEF TARİH</label>
                                <input name="hedef_tarih" type="date" defaultValue={rawDate} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500" />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>TAMAMLANMA (%)</label>
                                <input name="tamamlanma" type="number" min="0" max="100" defaultValue={project?.tamamlanma ?? 0} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500" />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>BEKLENEN ÇIKTI</label>
                                <input name="beklenen" type="text" defaultValue={project?.beklenen || ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500" />
                            </div>

                            <div>
                                <label className={LABEL_CLASS_NAME}>RİSK / BAĞIMLILIK</label>
                                <input name="risk" type="text" defaultValue={project?.risk || ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500" />
                            </div>

                            <div className="md:col-span-2">
                                <label className={LABEL_CLASS_NAME}>NOTLAR</label>
                                <textarea name="notlar" rows="3" defaultValue={project?.notlar || ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500 resize-none" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-slate-100 text-slate-600 py-3 text-sm font-semibold hover:bg-slate-200 transition cursor-pointer">Vazgeç</button>
                            <button type="submit" disabled={isPending} className="flex-1 rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 shadow-sm transition disabled:opacity-50 cursor-pointer">
                                {isPending ? 'Kaydediliyor...' : isEditMode ? 'Değişiklikleri Kaydet' : 'Projeyi Ekle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProjectModal;
