import { useEffect, useRef } from 'react';
import {
    TIME_FILTER_MODES,
    hasAdvancedFiltersActive,
} from '../../utils/projectFilters';

export default function FilterPanel({
    isOpen,
    onToggle,
    onClose,
    isTimeFilterActive,
    onTimeFilterActiveChange,
    timeSliderStep,
    onTimeSliderStepChange,
    urgencyFilter,
    onUrgencyFilterChange,
    urgencyOptions,
    showCompleted,
    onShowCompletedChange,
    onReset,
}) {
    const containerRef = useRef(null);
    const activeMode = TIME_FILTER_MODES.find((mode) => mode.step === timeSliderStep) ?? TIME_FILTER_MODES[1];
    const hasUrgencyChoices = (urgencyOptions ?? []).length > 1;
    const hasActiveFilters = hasAdvancedFiltersActive(isTimeFilterActive, urgencyFilter, showCompleted);

    useEffect(() => {
        if (!isOpen) return undefined;

        function handlePointerDown(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                onClose();
            }
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') onClose();
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className={`flex items-center gap-2 px-4 py-1.5 text-[16px] font-semibold rounded-xl border transition-all cursor-pointer select-none ${
                    isOpen || hasActiveFilters
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
            >   
                <span className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M2 4.6C2 4.03995 2 3.75992 2.10899 3.54601C2.20487 3.35785 2.35785 3.20487 2.54601 3.10899C2.75992 3 3.03995 3 3.6 3H20.4C20.9601 3 21.2401 3 21.454 3.10899C21.6422 3.20487 21.7951 3.35785 21.891 3.54601C22 3.75992 22 4.03995 22 4.6V5.26939C22 5.53819 22 5.67259 21.9672 5.79756C21.938 5.90831 21.8901 6.01323 21.8255 6.10776C21.7526 6.21443 21.651 6.30245 21.4479 6.4785L15.0521 12.0215C14.849 12.1975 14.7474 12.2856 14.6745 12.3922C14.6099 12.4868 14.562 12.5917 14.5328 12.7024C14.5 12.8274 14.5 12.9618 14.5 13.2306V18.4584C14.5 18.6539 14.5 18.7517 14.4685 18.8363C14.4406 18.911 14.3953 18.9779 14.3363 19.0315C14.2695 19.0922 14.1787 19.1285 13.9971 19.2012L10.5971 20.5612C10.2296 20.7082 10.0458 20.7817 9.89827 20.751C9.76927 20.7242 9.65605 20.6476 9.58325 20.5377C9.5 20.4122 9.5 20.2142 9.5 19.8184V13.2306C9.5 12.9618 9.5 12.8274 9.46715 12.7024C9.43805 12.5917 9.39014 12.4868 9.32551 12.3922C9.25258 12.2856 9.15102 12.1975 8.94789 12.0215L2.55211 6.4785C2.34898 6.30245 2.24742 6.21443 2.17449 6.10776C2.10986 6.01323 2.06195 5.90831 2.03285 5.79756C2 5.67259 2 5.53819 2 5.26939V4.6Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Filtreler
                </span>
                {hasActiveFilters && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" aria-label="Aktif filtre var" />
                )}
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Gelişmiş filtreler"
                    className="absolute right-0 mt-2 w-100 bg-white rounded-2xl border border-slate-200 shadow-xl p-5 z-50 origin-top-right"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-700">Gelişmiş Filtreler</h3>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={onReset}
                                className="text-[15px] font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer"
                            >
                                Temizle
                            </button>
                        )}
                    </div>

                    <section className="border-b border-slate-100 pb-4 mb-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="time-filter-toggle" className="text-lg font-bold text-slate-700 cursor-pointer">
                                📅 Zaman Filtresi
                            </label>
                            <input
                                id="time-filter-toggle"
                                type="checkbox"
                                checked={isTimeFilterActive}
                                onChange={(e) => onTimeFilterActiveChange(e.target.checked)}
                                className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500 cursor-pointer"
                            />
                        </div>

                        <div
                            className={`mt-4 transition-opacity duration-200 ${
                                isTimeFilterActive ? '' : 'opacity-40 pointer-events-none'
                            }`}
                        >
                            <div className="flex justify-between items-center text-[13px] font-bold text-blue-600 mb-2 gap-2">
                                <span className="shrink-0">Mod</span>
                                <span className="text-right truncate">
                                    {activeMode.emoji} {activeMode.label}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="1"
                                max="4"
                                step="1"
                                value={timeSliderStep}
                                disabled={!isTimeFilterActive}
                                onChange={(e) => onTimeSliderStepChange(Number(e.target.value))}
                                aria-valuemin={1}
                                aria-valuemax={4}
                                aria-valuenow={timeSliderStep}
                                aria-label="Zaman filtresi modu"
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
                            />

                            <div className="flex justify-between text-[12px] text-slate-400 mt-1 px-0.5 font-medium">
                                {TIME_FILTER_MODES.map((mode) => (
                                    <span
                                        key={mode.step}
                                        className={timeSliderStep === mode.step ? 'text-blue-600 font-bold' : ''}
                                    >
                                        {mode.shortLabel}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="border-b border-slate-100 pb-4 mb-4">
                        <label htmlFor="urgency-filter" className="block text-lg font-bold text-slate-700 mb-2">
                            Aciliyet Seviyesi
                        </label>
                        <select
                            id="urgency-filter"
                            value={urgencyFilter}
                            onChange={(e) => onUrgencyFilterChange(e.target.value)}
                            disabled={!hasUrgencyChoices}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[14px] font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {(urgencyOptions ?? []).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {!hasUrgencyChoices && (
                            <p className="mt-1.5 text-[14px] text-slate-400">Tabloda öncelik bilgisi bulunmuyor.</p>
                        )}
                    </section>

                    <section>
                        <div className="flex items-center justify-between gap-3">
                            <label htmlFor="show-completed-toggle" className="text-lg font-bold text-slate-700 cursor-pointer">
                                Tamamlanmış İşler
                            </label>
                            <button
                                id="show-completed-toggle"
                                type="button"
                                role="switch"
                                aria-checked={showCompleted}
                                onClick={() => onShowCompletedChange(!showCompleted)}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                                    showCompleted ? 'bg-blue-600' : 'bg-slate-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                        showCompleted ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>
                        <p className="mt-1.5 text-[14px] text-slate-400">
                            {showCompleted ? 'Tamamlanan işler listede görünür.' : 'Tamamlanan işler gizleniyor.'}
                        </p>
                    </section>
                </div>
            )}
        </div>
    );
}
