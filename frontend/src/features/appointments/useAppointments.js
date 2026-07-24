import { useState, useEffect, useCallback } from 'react';
import {
    fetchAppointments,
    deleteAppointment as deleteAppointmentApi,
} from './appointmentApi';

export function useAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAppointments = useCallback(async () => {
        try {
            const data = await fetchAppointments();
            setAppointments(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reloadAll = useCallback(async () => {
        await loadAppointments();
    }, [loadAppointments]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    useEffect(() => {
        const interval = setInterval(loadAppointments, 60_000);
        return () => clearInterval(interval);
    }, [loadAppointments]);

    const removeAppointmentFromLists = useCallback((appointmentId) => {
        setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
    }, []);

    const handleDeleteAppointment = useCallback(async (appoint) => {
        try {
            await deleteAppointmentApi(appoint.id);
            removeAppointmentFromLists(appoint.id);
            await reloadAll();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [removeAppointmentFromLists, reloadAll]);

    return {
        appointments,
        isLoading,
        error,
        loadAppointments,
        reloadAll,
        handleDeleteAppointment,
    };
}
