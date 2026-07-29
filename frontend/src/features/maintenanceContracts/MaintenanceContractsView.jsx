import { useState, useEffect, useActionState, useRef, useMemo } from 'react';
import { MenuIcon } from '../../components/dashboard/Sidebar';
import SplitText from '../../components/dashboard/SplitText';
import MaintenanceContractTable from '../../components/dashboard/MaintenanceContractTable';
import ContractModal from '../../components/dashboard/ContractModal';
import InvoiceModal from '../../components/dashboard/InvoiceModal';
import MonthlyMaintenanceModal from '../../components/dashboard/MonthlyMaintenanceModal';
import MaintenanceContractSummaryCards from '../../components/dashboard/MaintenanceContractSummaryCards';
import {
    buildYearOptions,
    CONTRACT_STATUS_FILTER_ACTIVE_STYLES,
    CONTRACT_STATUS_FILTER_INACTIVE_STYLES,
    CONTRACT_STATUS_FILTER_OPTIONS,
} from '../../constants/maintenanceContracts';
import {
    createMaintenanceContractAction,
    upsertInvoiceAction,
} from './maintenanceContractActions';
import { useMaintenanceContractFilters } from './useMaintenanceContractFilters';

export default function MaintenanceContractsView({
    contracts,
    year,
    isLoading,
    error,
    onYearChange,
    onReload,
    onEditContract,
    onOpenSidebar,
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [invoiceContext, setInvoiceContext] = useState(null);
    const [monthlySummaryMonth, setMonthlySummaryMonth] = useState(null);

    const [createState, createAction, isCreatePending] = useActionState(
        createMaintenanceContractAction,
        { success: false, error: null },
    );
    const wasCreatePendingRef = useRef(false);

    const [invoiceState, invoiceAction, isInvoicePending] = useActionState(
        upsertInvoiceAction,
        { success: false, error: null },
    );
    const wasInvoicePendingRef = useRef(false);

    const {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        filteredContracts,
        hasActiveSearch,
        hasActiveStatusFilter,
        hasActiveFilters,
    } = useMaintenanceContractFilters(contracts);

    const yearOptions = buildYearOptions(new Date().getFullYear());
    const currentMonth = useMemo(() => new Date().getMonth() + 1, []);
    const showSummaryCards = !isLoading && contracts.length > 0;

    useEffect(() => {
        const wasPending = wasCreatePendingRef.current;
        wasCreatePendingRef.current = isCreatePending;

        if (wasPending && !isCreatePending && createState?.success && isCreateOpen) {
            onReload?.();
            setIsCreateOpen(false);
        }
    }, [createState?.success, isCreateOpen, isCreatePending, onReload]);

    useEffect(() => {
        const wasPending = wasInvoicePendingRef.current;
        wasInvoicePendingRef.current = isInvoicePending;

        if (wasPending && !isInvoicePending && invoiceState?.success && invoiceContext) {
            onReload?.();
            setInvoiceContext(null);
        }
    }, [invoiceState?.success, invoiceContext, isInvoicePending, onReload]);

    function handleMonthCellClick(contract, month, invoice) {
        setInvoiceContext({ contract, year, month, invoice });
    }

    function handleMonthHeaderClick(month) {
        setMonthlySummaryMonth(month);
    }

    function handleMonthlyEntryClick(contract, invoice) {
        const month = monthlySummaryMonth;
        setMonthlySummaryMonth(null);
        setInvoiceContext({ contract, year, month, invoice });
    }

    return (
        <>
            <header className="mb-8">
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={onOpenSidebar}
                            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition cursor-pointer shrink-0"
                            aria-label="Menüyü aç"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight min-w-0">
                            <SplitText
                                text="Bakım Anlaşmaları & Fatura Takip Tablosu"
                                delay={40}
                                duration={1.1}
                                ease="power3.out"
                                splitType="chars"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                rootMargin="-100px"
                                textAlign="left"
                                showCallback
                            />
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto">
                        <div className="w-full sm:w-60 relative">
                            <input
                                type="text"
                                placeholder="Firma Ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 shadow-xs pr-9"
                                aria-label="Firma ara"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    tabIndex={-1}
                                    aria-label="Aramayı temizle"
                                >
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                        <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Yıl
                            </span>
                            <select
                                value={year}
                                onChange={(e) => onYearChange(Number(e.target.value))}
                                className="text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer pr-1"
                                aria-label="Yıl seçici"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 shadow-sm transition cursor-pointer"
                        >
                            + Yeni Firma / Sözleşme
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                    <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200/60 select-none w-fit gap-0.5">
                        {['HEPSİ', ...CONTRACT_STATUS_FILTER_OPTIONS.map((option) => option.value)].map((status) => {
                            const isActive = statusFilter === status;

                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? CONTRACT_STATUS_FILTER_ACTIVE_STYLES[status]
                                            : CONTRACT_STATUS_FILTER_INACTIVE_STYLES[status]
                                    }`}
                                >
                                    {status}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {showSummaryCards && (
                    <MaintenanceContractSummaryCards
                        contracts={filteredContracts}
                        year={year}
                        month={currentMonth}
                        onMonthSummaryClick={handleMonthHeaderClick}
                    />
                )}
            </header>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-medium">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-500 font-medium">
                    Sözleşmeler yükleniyor...
                </div>
            ) : contracts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <p className="text-slate-600 font-semibold mb-1">Henüz sözleşme yok</p>
                    <p className="text-sm text-slate-400">
                        Yeni firma ekleyerek tabloyu oluşturmaya başlayın.
                    </p>
                </div>
            ) : filteredContracts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <p className="text-slate-600 font-semibold mb-1">
                        {hasActiveFilters ? 'Sonuç bulunamadı' : 'Arama sonucu bulunamadı'}
                    </p>
                    <p className="text-sm text-slate-400">
                        {hasActiveSearch && hasActiveStatusFilter
                            ? `"${searchTerm.trim()}" ve "${statusFilter}" filtresine uygun sözleşme yok.`
                            : hasActiveSearch
                                ? `"${searchTerm.trim()}" için eşleşen firma yok.`
                                : hasActiveStatusFilter
                                    ? `"${statusFilter}" filtresine uygun sözleşme yok.`
                                    : 'Filtreye uygun sözleşme bulunamadı.'}
                    </p>
                </div>
            ) : (
                <MaintenanceContractTable
                    contracts={filteredContracts}
                    year={year}
                    canEdit
                    onCompanyClick={onEditContract}
                    onMonthCellClick={handleMonthCellClick}
                    onMonthHeaderClick={handleMonthHeaderClick}
                />
            )}

            <MonthlyMaintenanceModal
                isOpen={monthlySummaryMonth !== null}
                onClose={() => setMonthlySummaryMonth(null)}
                contracts={filteredContracts}
                year={year}
                month={monthlySummaryMonth}
                canEdit
                onEntryClick={handleMonthlyEntryClick}
            />

            <ContractModal
                key={isCreateOpen ? 'create-open' : 'create-closed'}
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                formAction={createAction}
                formState={createState}
                isPending={isCreatePending}
            />

            <InvoiceModal
                key={invoiceContext ? `inv-${invoiceContext.contract.id}-${invoiceContext.month}` : 'inv-none'}
                isOpen={!!invoiceContext}
                onClose={() => setInvoiceContext(null)}
                formAction={invoiceAction}
                formState={invoiceState}
                isPending={isInvoicePending}
                context={invoiceContext}
                onCleared={onReload}
            />
        </>
    );
}
