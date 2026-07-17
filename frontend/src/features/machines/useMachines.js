import { useState, useEffect, useCallback } from 'react';
import {
    fetchMachines,
    deleteMachine as deleteMachineApi,
    importMachines as importMachinesApi,
} from './machineApi';
import { VIEWS } from '../../constants/views';

export function useMachines(activeView) {
    const [machines, setMachines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadMachines = useCallback(async () => {
        try {
            const data = await fetchMachines();
            setMachines(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reloadAll = useCallback(async () => {
        await loadMachines();
    }, [loadMachines]);

    useEffect(() => {
        if (activeView === VIEWS.MACHINES) {
            loadMachines();
        }
    }, [activeView, loadMachines]);

    const removeMachineFromLists = useCallback((machineId) => {
        setMachines((prev) => prev.filter((m) => m.id !== machineId));
    }, []);

    const handleDeleteMachine = useCallback(async (machine) => {
        try {
            await deleteMachineApi(machine.id);
            removeMachineFromLists(machine.id);
            await reloadAll();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [removeMachineFromLists, reloadAll]);

    const handleImport = useCallback(async (formData) => {
        const result = await importMachinesApi(formData);
        await loadMachines();
        return result;
    }, [loadMachines]);

    return {
        machines,
        isLoading,
        error,
        loadMachines,
        reloadAll,
        handleDeleteMachine,
        handleImport,
    };
}
