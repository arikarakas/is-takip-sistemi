import { useState, useEffect, useCallback } from 'react';
import {
    fetchProjects,
    fetchAssignedProjects,
    deleteProject as deleteProjectApi,
    importProjects as importProjectsApi,
} from './projectApi';

export function useProjects(activeView) {
    const [projects, setProjects] = useState([]);
    const [assignedProjects, setAssignedProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssignedLoading, setIsAssignedLoading] = useState(false);
    const [error, setError] = useState(null);
    const [assignedError, setAssignedError] = useState(null);

    const loadProjects = useCallback(async () => {
        try {
            const data = await fetchProjects();
            setProjects(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadAssignedProjects = useCallback(async () => {
        setIsAssignedLoading(true);
        try {
            const data = await fetchAssignedProjects();
            setAssignedProjects(data);
            setAssignedError(null);
        } catch (err) {
            console.error(err);
            setAssignedError(err.message);
        } finally {
            setIsAssignedLoading(false);
        }
    }, []);

    const reloadAll = useCallback(async () => {
        await Promise.all([loadProjects(), loadAssignedProjects()]);
    }, [loadProjects, loadAssignedProjects]);

    /** Arka plan yenileme: loading bayrağı yok, hata olursa mevcut liste korunur. */
    const refreshQuietly = useCallback(async () => {
        try {
            const [all, assigned] = await Promise.all([
                fetchProjects(),
                fetchAssignedProjects(),
            ]);
            setProjects(all);
            setAssignedProjects(assigned);
            setError(null);
            setAssignedError(null);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        if (activeView === 'projects') {
            loadProjects();
        } else if (activeView === 'assigned') {
            loadAssignedProjects();
        }
    }, [activeView, loadProjects, loadAssignedProjects]);

    const removeProjectFromLists = useCallback((projectId) => {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setAssignedProjects((prev) => prev.filter((p) => p.id !== projectId));
    }, []);

    const handleDeleteProject = useCallback(async (project) => {
        try {
            await deleteProjectApi(project.id);
            removeProjectFromLists(project.id);
            await reloadAll();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [removeProjectFromLists, reloadAll]);

    const handleImport = useCallback(async (formData) => {
        const result = await importProjectsApi(formData);
        await loadProjects();
        return result;
    }, [loadProjects]);

    return {
        projects,
        assignedProjects,
        isLoading,
        isAssignedLoading,
        error,
        assignedError,
        loadProjects,
        loadAssignedProjects,
        reloadAll,
        refreshQuietly,
        handleDeleteProject,
        handleImport,
    };
}
