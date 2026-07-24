import { useEffect, useState } from 'react';
import { INPUT_CLASS_NAME, LABEL_CLASS_NAME } from '../../constants/projects';
import { formatDateLongTR, getDefaultTimeForDate, splitStartTime } from '../../utils/appointmentCalendar';
import { TimePicker } from 'react-accessible-time-picker';

function CalendarIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}

function toTimePickerValue(time) {
    const [hour = '09', minute = '00'] = String(time || '09:00').split(':');
    return {
        hour: hour.padStart(2, '0'),
        minute: minute.padStart(2, '0'),
    };
}

function toTimeString(value) {
    if (!value?.hour || !value?.minute) return '';
    return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
}

export default function AppointmentModal({
    isOpen,
    onClose,
    formAction,
    formState,
    isPending,
    appointment = null,
    defaultDate = '',
}) {
    const isEditMode = !!appointment;
    const fromAppointment = splitStartTime(appointment?.start_time);
    const initialDate = fromAppointment.date || defaultDate || '';
    const initialTime = fromAppointment.time || (defaultDate ? getDefaultTimeForDate(defaultDate) : '09:00');
    const [timeValue, setTimeValue] = useState(() => toTimePickerValue(initialTime));
    const appointmentTime = toTimeString(timeValue);

    useEffect(() => {
        if (!isOpen) return;
        setTimeValue(toTimePickerValue(initialTime));
    }, [isOpen, initialTime, appointment?.id]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-5 text-white shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                                <CalendarIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-100/90">
                                    {isEditMode ? 'Randevuyu Düzenle' : 'Yeni Randevu'}
                                </p>
                                <h3 className="text-lg font-black tracking-tight truncate">
                                    {isEditMode ? appointment.title : 'Takvime Ekle'}
                                </h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-white/70 hover:text-white font-bold cursor-pointer text-xl shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                    {!isEditMode && defaultDate && (
                        <p className="mt-3 text-sm text-blue-100/90 font-medium">
                            {formatDateLongTR(defaultDate)}
                        </p>
                    )}
                </div>

                <div className="overflow-y-auto px-6 py-5">
                    {formState?.error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium">
                            {formState.error}
                        </div>
                    )}

                    <form action={formAction} className="space-y-4" autoComplete="off">
                        {isEditMode && (
                            <input type="hidden" name="appointmentId" value={appointment.id} />
                        )}

                        <div>
                            <label className={LABEL_CLASS_NAME}>Randevu Başlığı *</label>
                            <input
                                name="title"
                                type="text"
                                required
                                defaultValue={appointment?.title || ''}
                                placeholder="Örn. Müşteri görüşmesi"
                                className={INPUT_CLASS_NAME}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={LABEL_CLASS_NAME}>Tarih *</label>
                                <input
                                    name="appointment_date"
                                    type="date"
                                    required
                                    defaultValue={initialDate}
                                    className={`${INPUT_CLASS_NAME} h-10`}
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLASS_NAME}>Saat *</label>
                                <input type="hidden" name="appointment_time" value={appointmentTime} />
                                <div
                                    className={`${INPUT_CLASS_NAME} flex h-10 items-center py-0! focus-within:border-blue-500 focus-within:bg-white`}
                                    style={{
                                        '--time-bg': 'transparent',
                                        '--time-border': 'transparent',
                                        '--time-focus-border': 'transparent',
                                        '--time-text': '#0f172a',
                                        '--time-separator': '#94a3b8',
                                        '--time-icon': '#64748b',
                                        '--time-hover': '#f1f5f9',
                                        '--time-focus': '#f1f5f9',
                                        '--time-active': '#dbeafe',
                                        '--time-icon': '#000000',
                                    }}
                                >
                                    <TimePicker
                                        is24Hour
                                        minuteStep={15}
                                        required
                                        value={timeValue}
                                        onChange={setTimeValue}
                                        hourPlaceholder="--"
                                        minutePlaceholder="--"
                                        popoverColumnHourTitle="Saat"
                                        popoverColumnMinuteTitle="Dakika"
                                        classes={{
                                            container: 'flex h-full w-full gap-0',
                                            timePicker:
                                                '!flex !h-full !w-full !items-center !border-0 !bg-transparent !p-0 !rounded-none !shadow-none',
                                            timeInputs: '!h-full !items-center',
                                            timeInput: '!h-auto !text-sm !leading-none !py-0',
                                            separator: '!text-sm !leading-none !font-normal !px-0.5',
                                            timeTrigger: '!size-4 !shrink-0 !p-0 [&_svg]:size-3.5',
                                            popoverContent: '!z-[100]',
                                            selectContent: '!z-[100]',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={LABEL_CLASS_NAME}>Müşteri / Kişi</label>
                            <input
                                name="client_name"
                                type="text"
                                defaultValue={appointment?.client_name || ''}
                                placeholder="Opsiyonel"
                                className={INPUT_CLASS_NAME}
                            />
                        </div>

                        <div>
                            <label className={LABEL_CLASS_NAME}>Sorumlu Kişi(ler)</label>
                            <input
                                name="sorumlular"
                                type="text"
                                defaultValue={appointment?.sorumlular || ''}
                                placeholder="Opsiyonel"
                                className={INPUT_CLASS_NAME}
                            />
                        </div>

                        <div>
                            <label className={LABEL_CLASS_NAME}>Notlar</label>
                            <textarea
                                name="description"
                                defaultValue={appointment?.description || ''}
                                placeholder="Randevu detayları..."
                                rows={3}
                                className={`${INPUT_CLASS_NAME} resize-none min-h-[88px]`}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl bg-slate-100 text-slate-600 py-3 text-sm font-semibold hover:bg-slate-200 transition cursor-pointer"
                            >
                                Vazgeç
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
                            >
                                {isPending ? 'Kaydediliyor...' : isEditMode ? 'Güncelle' : 'Randevu Ekle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
