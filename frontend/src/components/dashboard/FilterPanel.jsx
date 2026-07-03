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
    priorityFilter,
    onPriorityFilterChange,
    priorityOptions,
    onReset,
}) {
    const containerRef = useRef(null);
    const activeMode = TIME_FILTER_MODES.find((mode) => mode.step === timeSliderStep) ?? TIME_FILTER_MODES[1];
    const hasPriorityChoices = priorityOptions.length > 1;
    const hasActiveFilters = hasAdvancedFiltersActive(isTimeFilterActive, priorityFilter);

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
                className={`flex items-center gap-2 px-4 py-1.5 text-lg font-semibold rounded-xl border transition-all cursor-pointer select-none ${
                    isOpen || hasActiveFilters
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
            >
                Filtreler
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

                    <section>
                        <label htmlFor="priority-filter" className="block text-lg font-bold text-slate-700 mb-2">
                            Öncelik Seviyesi
                        </label>
                        <select
                            id="priority-filter"
                            value={priorityFilter}
                            onChange={(e) => onPriorityFilterChange(e.target.value)}
                            disabled={!hasPriorityChoices}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[14px] font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {!hasPriorityChoices && (
                            <p className="mt-1.5 text-[14px] text-slate-400">Tabloda öncelik bilgisi bulunmuyor.</p>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
