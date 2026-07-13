import { useState, useMemo, useEffect } from 'react';
import { matchesTimeFilter, matchesUrgencyFilter, getUrgencyFilterOptions } from '../../utils/projectFilters';
import { sortProjects } from '../../utils/projectSort';

export function useProjectFilters(projects) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('HEPSİ');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isTimeFilterActive, setIsTimeFilterActive] = useState(false);
    const [timeSliderStep, setTimeSliderStep] = useState(2);
    const [urgencyFilter, setUrgencyFilter] = useState('TÜMÜ');

    const urgencyOptions = useMemo(() => getUrgencyFilterOptions(projects), [projects]);

    useEffect(() => {
        const validValues = new Set(urgencyOptions.map((option) => option.value));
        if (!validValues.has(urgencyFilter)) {
            setUrgencyFilter('TÜMÜ');
        }
    }, [urgencyOptions, urgencyFilter]);

    const filteredProjects = useMemo(() => {
        const statusFiltered = projects.filter((project) => {
            if (statusFilter === 'HEPSİ') return true;

            const projStatus = (project.durum || '').trim().toLocaleUpperCase('tr-TR');
            return projStatus === statusFilter.toLocaleUpperCase('tr-TR');
        });

        return statusFiltered.filter((project) => {
            const searchString = searchTerm.toLowerCase();
            const matchesSearch = (
                (project.title || '').toLowerCase().includes(searchString) ||
                (project.client || '').toLowerCase().includes(searchString) ||
                (project.sorumlular || '').toLowerCase().includes(searchString) ||
                (project.ilgili || '').toLowerCase().includes(searchString)
            );

            if (!matchesSearch) return false;
            if (isTimeFilterActive && !matchesTimeFilter(project.hedef_tarih, timeSliderStep)) return false;
            if (!matchesUrgencyFilter(project.aciliyet, urgencyFilter)) return false;

            return true;
        });
    }, [projects, statusFilter, searchTerm, isTimeFilterActive, timeSliderStep, urgencyFilter]);

    function resetAdvancedFilters() {
        setIsTimeFilterActive(false);
        setTimeSliderStep(2);
        setUrgencyFilter('TÜMÜ');
    }

    return {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        isFilterPanelOpen,
        setIsFilterPanelOpen,
        isTimeFilterActive,
        setIsTimeFilterActive,
        timeSliderStep,
        setTimeSliderStep,
        urgencyFilter,
        setUrgencyFilter,
        urgencyOptions,
        filteredProjects,
        resetAdvancedFilters,
    };
}

export function useProjectSort() {
    const [sortKey, setSortKey] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const applySort = (list) => sortProjects(list, sortKey, sortDirection);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    return { sortKey, sortDirection, handleSort, applySort };
}
