import {
    buildMonthGrid,
    formatTimeTR,
    getWeekdayNamesTR,
    groupAppointmentsByDate,
} from '../../utils/appointmentCalendar';

const MAX_VISIBLE = 3;

function PlusIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

function AppointmentChip({ appointment, onClick }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(appointment);
            }}
            className="w-full text-left truncate rounded-md px-2 py-1 text-[11px] font-semibold bg-blue-600/90 text-white hover:bg-blue-700 transition cursor-pointer shadow-sm"
            title={`${formatTimeTR(appointment.start_time)} · ${appointment.title}`}
        >
            <span className="opacity-80 mr-1">{formatTimeTR(appointment.start_time)}</span>
            {appointment.title}
        </button>
    );
}

export default function AppointmentCalendar({
    year,
    month,
    appointments,
    onDayAdd,
    onAppointmentClick,
}) {
    const cells = buildMonthGrid(year, month);
    const grouped = groupAppointmentsByDate(appointments);
    const weekdays = getWeekdayNamesTR();

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
                {weekdays.map((name) => (
                    <div
                        key={name}
                        className="py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400"
                    >
                        {name}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {cells.map((cell) => {
                    const dayAppointments = grouped.get(cell.dateKey) || [];
                    const visible = dayAppointments.slice(0, MAX_VISIBLE);
                    const hiddenCount = dayAppointments.length - visible.length;

                    return (
                        <div
                            key={cell.dateKey}
                            className={`relative min-h-[120px] border-b border-r border-slate-100 p-2 flex flex-col transition-colors ${
                                cell.inCurrentMonth ? 'bg-white' : 'bg-slate-50/60'
                            } ${cell.isToday ? 'ring-2 ring-inset ring-blue-400/60 bg-blue-50/30' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-1.5">
                                <span
                                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full text-sm font-bold ${
                                        cell.isToday
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : cell.inCurrentMonth
                                                ? 'text-slate-700'
                                                : 'text-slate-300'
                                    }`}
                                >
                                    {cell.day}
                                </span>
                            </div>

                            <div className="flex-1 space-y-1 overflow-hidden">
                                {visible.map((appointment) => (
                                    <AppointmentChip
                                        key={appointment.id}
                                        appointment={appointment}
                                        onClick={onAppointmentClick}
                                    />
                                ))}
                                {hiddenCount > 0 && (
                                    <p className="px-1 text-[10px] font-semibold text-slate-400">
                                        +{hiddenCount} daha
                                    </p>
                                )}
                            </div>

                            {cell.inCurrentMonth && (
                                <button
                                    type="button"
                                    onClick={() => onDayAdd?.(cell.dateKey)}
                                    className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition cursor-pointer shadow-sm"
                                    aria-label={`${cell.day}. güne randevu ekle`}
                                    title="Randevu ekle"
                                >
                                    <PlusIcon className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
