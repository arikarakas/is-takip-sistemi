import { useState, useMemo } from 'react';
import { matchesContractStatusFilter } from '../../constants/maintenanceContracts';

function matchesContractSearch(contract, search) {
    const fields = [
        contract.company_name,
        contract.period_type,
        contract.payment_term,
    ];

    return fields.some((value) =>
        String(value ?? '').toLocaleLowerCase('tr-TR').includes(search),
    );
}

export function useMaintenanceContractFilters(contracts) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('HEPSİ');

    const filteredContracts = useMemo(() => {
        const search = searchTerm.trim().toLocaleLowerCase('tr-TR');

        return contracts.filter((contract) => {
            if (!matchesContractStatusFilter(contract, statusFilter)) return false;
            if (!search) return true;
            return matchesContractSearch(contract, search);
        });
    }, [contracts, searchTerm, statusFilter]);

    const hasActiveSearch = searchTerm.trim().length > 0;
    const hasActiveStatusFilter = statusFilter !== 'HEPSİ';
    const hasActiveFilters = hasActiveSearch || hasActiveStatusFilter;

    return {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        filteredContracts,
        hasActiveSearch,
        hasActiveStatusFilter,
        hasActiveFilters,
    };
}
