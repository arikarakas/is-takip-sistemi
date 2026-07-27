import { useState, useEffect, useCallback } from 'react';
import {
    fetchMaintenanceContracts,
    deleteMaintenanceContract as deleteContractApi,
} from './maintenanceContractApi';
import { VIEWS } from '../../constants/views';

export function useMaintenanceContracts(activeView) {
    const [contracts, setContracts] = useState([]);
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadContracts = useCallback(async (targetYear = year) => {
        setIsLoading(true);
        try {
            const data = await fetchMaintenanceContracts(targetYear);
            setContracts(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [year]);

    useEffect(() => {
        if (activeView === VIEWS.MAINTENANCE_CONTRACTS) {
            loadContracts(year);
        }
    }, [activeView, year, loadContracts]);

    const handleYearChange = useCallback((nextYear) => {
        setYear(Number(nextYear));
    }, []);

    const handleDeleteContract = useCallback(async (contract) => {
        try {
            await deleteContractApi(contract.id);
            setContracts((prev) => prev.filter((c) => c.id !== contract.id));
            await loadContracts();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [loadContracts]);

    return {
        contracts,
        year,
        isLoading,
        error,
        loadContracts,
        handleYearChange,
        handleDeleteContract,
    };
}
