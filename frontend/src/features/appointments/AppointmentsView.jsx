import { useState, useEffect, useActionState, useRef } from 'react';
import { MenuIcon } from '../../components/dashboard/Sidebar';
import AppointmentCalendar from '../../components/dashboard/AppointmentCalendar';
import AppointmentModal from '../../components/dashboard/AppointmentModal';
import SplitText from '../../components/dashboard/SplitText';
import { createAppointmentAction } from './appointmentActions';
import { formatMonthYearTR } from '../../utils/appointmentCalendar';

function ChevronLeftIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    );
}

function ChevronRightIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

export default function AppointmentsView({
    appointments,
    isLoading,
    error,
    onReload,
    onOpenSidebar,
    onAppointmentClick,
}) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createDefaultDate, setCreateDefaultDate] = useState('');
    const [formState, formAction, isPending] = useActionState(createAppointmentAction, { success: false, error: null });
    const wasCreatePendingRef = useRef(false);

    function goToPreviousMonth() {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    }

    function goToNextMonth() {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    }

    function goToToday() {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
    }

    function openCreateModal(dateKey = '') {
        setCreateDefaultDate(dateKey);
        setIsCreateOpen(true);
    }

    function closeCreateModal() {
        setIsCreateOpen(false);
        setCreateDefaultDate('');
    }

    useEffect(() => {
        const wasPending = wasCreatePendingRef.current;
        wasCreatePendingRef.current = isPending;

        if (wasPending && !isPending && formState?.success && isCreateOpen) {
            onReload?.();
            closeCreateModal();
        }
    }, [formState?.success, isCreateOpen, isPending, onReload]);

    return (
        <>
            <header className="mb-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onOpenSidebar}
                            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                            aria-label="Menüyü aç"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            <SplitText
                                text="Randevular"
                                delay={50}
                                duration={1.25}
                                ease="power3.out"
                                splitType="chars"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                rootMargin="-100px"
                                textAlign="center"
                                showCallback
                            />
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => openCreateModal('')}
                        className="self-start lg:self-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
                    >
                        + Yeni Randevu Ekle
                    </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={goToPreviousMonth}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-sm"
                            aria-label="Önceki ay"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <h2 className="min-w-[180px] text-center text-lg font-black text-slate-800 tracking-tight">
                            {formatMonthYearTR(viewYear, viewMonth)}
                        </h2>
                        <button
                            type="button"
                            onClick={goToNextMonth}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-sm"
                            aria-label="Sonraki ay"
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={goToToday}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-sm"
                    >
                        Bugün
                    </button>
                </div>
            </header>

            {isLoading && (
                <div className="text-center p-12 text-slate-500 rounded-2xl bg-white border border-slate-100">
                    Randevular yükleniyor...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-4">
                    Hata: {error}
                </div>
            )}

            {!isLoading && !error && (
                <AppointmentCalendar
                    year={viewYear}
                    month={viewMonth}
                    appointments={appointments}
                    onDayAdd={openCreateModal}
                    onAppointmentClick={onAppointmentClick}
                />
            )}

            <AppointmentModal
                key={isCreateOpen ? `create-${createDefaultDate || 'new'}` : 'create-closed'}
                isOpen={isCreateOpen}
                onClose={closeCreateModal}
                formAction={formAction}
                formState={formState}
                isPending={isPending}
                defaultDate={createDefaultDate}
            />
        </>
    );
}
