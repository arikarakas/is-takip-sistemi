import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    formatTimeTR,
    getDaysUntil,
    getUpcomingAppointments,
} from '../../utils/appointmentCalendar';
import ShinyText from './ShinyText';

const MIN_WIDTH_PX = 288; // 18rem — kısa listelerde dar görünmesin
const COLLAPSE_MS = 200; // transition-[max-height] duration-200 ile aynı
const SECTION_CLASS =
    'relative shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm';

function formatRelativeDay(startTime) {
    const days = getDaysUntil(startTime);
    if (days === 0) return 'Bugün';
    if (days === 1) return 'Yarın';
    return `${days} gün sonra`;
}

function ChevronDownIcon({ className }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

function AppointmentRow({ appointment, onAppointmentClick, className = '' }) {
    return (
        <button
            type="button"
            onClick={() => onAppointmentClick?.(appointment)}
            className={`text-left px-5 py-1.5 hover:bg-blue-50/50 transition cursor-pointer ${className}`}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 whitespace-nowrap">
                    <p className="font-semibold text-slate-800">
                        {appointment.title}
                    </p>
                    {appointment.client_name && (
                        <p className="mt-0.5 text-xs text-slate-500">
                            {appointment.client_name}
                        </p>
                    )}
                </div>
                <span className="shrink-0 rounded-lg bg-red-50 border border-red-500/50 px-2 py-1 text-[12px] font-bold text-red-600 whitespace-nowrap">
                    {formatRelativeDay(appointment.start_time)}
                    {' · '}
                    {formatTimeTR(appointment.start_time)}
                </span>
            </div>
        </button>
    );
}

function observeSize(el, onMeasure) {
    onMeasure();
    const observer = new ResizeObserver(onMeasure);
    observer.observe(el);
    return () => observer.disconnect();
}

function useExpandableOverlay(rootRef) {
    const [expanded, setExpanded] = useState(false);
    const [overlayActive, setOverlayActive] = useState(false);

    const reset = useCallback(() => {
        setExpanded(false);
        setOverlayActive(false);
    }, []);

    useEffect(() => {
        if (!expanded) return undefined;

        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setExpanded(false);
            }
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setExpanded(false);
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [expanded, rootRef]);

    // transitionend gelmezse overlayActive takılı kalmasın
    useEffect(() => {
        if (expanded || !overlayActive) return undefined;
        const timer = window.setTimeout(() => {
            setOverlayActive(false);
        }, COLLAPSE_MS + 50);
        return () => window.clearTimeout(timer);
    }, [expanded, overlayActive]);

    return {
        expanded,
        overlayActive,
        reset,
        toggle: () => {
            if (expanded) {
                setExpanded(false);
            } else {
                setOverlayActive(true);
                setExpanded(true);
            }
        },
        onCollapseTransitionEnd: (event) => {
            if (event.propertyName !== 'max-height') return;
            if (event.target !== event.currentTarget) return;
            if (!expanded) setOverlayActive(false);
        },
    };
}

function MoreAppointmentsDrawer({
    appointments,
    onAppointmentClick,
    expanded,
    overlayActive,
    onToggle,
    onCollapseTransitionEnd,
}) {
    const listRef = useRef(null);
    const [listHeight, setListHeight] = useState(0);
    const restKey = appointments.map((item) => item.id).join(',');

    useLayoutEffect(() => {
        const el = listRef.current;
        if (!el) return undefined;
        return observeSize(el, () => setListHeight(el.scrollHeight));
    }, [restKey, expanded, overlayActive]);

    return (
        <div className="relative h-9">
            <div
                className={`absolute inset-x-0 top-0 z-30 flex flex-col overflow-hidden bg-white ${
                    overlayActive
                        ? 'rounded-b-2xl border border-t-0 border-slate-200 shadow-lg'
                        : ''
                }`}
            >
                <div
                    className="overflow-hidden transition-[max-height] duration-200 ease-out"
                    style={{
                        maxHeight: expanded ? Math.max(listHeight + 4, 0) : 0,
                    }}
                    onTransitionEnd={onCollapseTransitionEnd}
                >
                    <ul
                        ref={listRef}
                        className="divide-y divide-slate-200 border-t border-slate-200"
                    >
                        {appointments.map((appointment) => (
                            <li key={appointment.id}>
                                <AppointmentRow
                                    appointment={appointment}
                                    onAppointmentClick={onAppointmentClick}
                                    className="w-full"
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={expanded}
                    aria-label={
                        expanded
                            ? 'Diğer randevuları gizle'
                            : `Diğer ${appointments.length} randevuyu göster`
                    }
                    className="relative z-10 flex h-9 shrink-0 w-full items-center justify-center gap-1 border-t border-slate-200 bg-white text-red-500 hover:bg-slate-50 hover:text-red-600 transition cursor-pointer whitespace-nowrap"
                >
                    <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 ${
                            expanded ? 'rotate-180' : ''
                        }`}
                    />
                    <span className="text-xs font-semibold">
                        {expanded
                            ? 'Daha az göster'
                            :   <ShinyText
                                    text={`${appointments.length} randevu daha`}
                                    speed={2.5}
                                    color="#fb2c36"
                                    shineColor="#e2c5c6"
                                    spread={120}
                                    direction="left"
                                    className="text-xs font-black tracking-tight"
                                />
                        }
                    </span>
                </button>
            </div>
        </div>
    );
}

export default function UpcomingAppointments({
    appointments = [],
    isLoading = false,
    onAppointmentClick,
    maxDays = 1,
    limit = 5,
}) {
    const rootRef = useRef(null);
    const widthMeasureRef = useRef(null);
    const [contentWidth, setContentWidth] = useState(MIN_WIDTH_PX);
    const { expanded, overlayActive, reset, toggle, onCollapseTransitionEnd } =
        useExpandableOverlay(rootRef);

    const upcoming = getUpcomingAppointments(appointments, { maxDays, limit });
    const [first, ...rest] = upcoming;
    const hasMore = rest.length > 0;
    const upcomingKey = upcoming.map((item) => item.id).join(',');

    useEffect(() => {
        if (isLoading || !hasMore) reset();
    }, [isLoading, hasMore, reset]);

    useLayoutEffect(() => {
        const measureRoot = widthMeasureRef.current;
        if (!measureRoot) return undefined;

        return observeSize(measureRoot, () => {
            const rows = measureRoot.querySelectorAll('[data-measure-row]');
            let widest = 0;
            rows.forEach((row) => {
                widest = Math.max(widest, row.scrollWidth);
            });
            setContentWidth(Math.max(MIN_WIDTH_PX, widest));
        });
    }, [upcomingKey]);

    if (isLoading) {
        return (
            <section
                className={`${SECTION_CLASS} px-5 py-8 text-center text-sm text-slate-400`}
                style={{ width: MIN_WIDTH_PX, minWidth: MIN_WIDTH_PX }}
            >
                Yaklaşan randevular yükleniyor...
            </section>
        );
    }

    return (
        <section
            ref={rootRef}
            className={`${SECTION_CLASS} ${
                overlayActive ? 'z-20 overflow-visible' : 'z-0 overflow-hidden'
            }`}
            style={{ width: contentWidth, minWidth: MIN_WIDTH_PX }}
        >
            {/* Gizli ölçüm: en uzun satırın gerçek genişliği (w-full kullanmadan) */}
            <div
                ref={widthMeasureRef}
                className="absolute left-0 top-0 -z-10 h-0 overflow-hidden opacity-0 pointer-events-none"
                aria-hidden="true"
            >
                {upcoming.map((appointment) => (
                    <div key={`measure-${appointment.id}`} data-measure-row>
                        <AppointmentRow
                            appointment={appointment}
                            className="w-max"
                        />
                    </div>
                ))}
            </div>

            {upcoming.length === 0 ? (
                <div className="flex justify-center items-center w-full h-full min-h-9">
                    <p className="px-5 py-2 text-center text-sm text-slate-600 font-semibold whitespace-nowrap m-0">
                        Önümüzdeki {maxDays} gün içinde randevu yok
                    </p>
                </div>
           
            ) : (
                <div>
                    <AppointmentRow
                        appointment={first}
                        onAppointmentClick={onAppointmentClick}
                        className="w-full"
                    />

                    {hasMore && (
                        <MoreAppointmentsDrawer
                            appointments={rest}
                            onAppointmentClick={onAppointmentClick}
                            expanded={expanded}
                            overlayActive={overlayActive}
                            onToggle={toggle}
                            onCollapseTransitionEnd={onCollapseTransitionEnd}
                        />
                    )}
                </div>
            )}
        </section>
    );
}
