import { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../components/dashboard/useNotification';
import {
    fetchRecentChanges,
    fetchUnreadChangesCount,
    markChangesViewed,
} from './changesApi';

export function useRecentChanges(activeView, onNavigateToActivity) {
    const [recentChanges, setRecentChanges] = useState([]);
    const [changesLoading, setChangesLoading] = useState(false);
    const [changesError, setChangesError] = useState(null);
    const [unreadChangesCount, setUnreadChangesCount] = useState(0);
    const previousUnreadCountRef = useRef(null);
    const isUnreadNotificationReadyRef = useRef(false);

    const { triggerNotification } = useNotification();

    async function loadRecentChanges() {
        setChangesLoading(true);
        setChangesError(null);

        try {
            const data = await fetchRecentChanges(30);
            setRecentChanges(data);
            await markChangesViewed();
            setUnreadChangesCount(0);
        } catch (err) {
            setChangesError(err.message);
        } finally {
            setChangesLoading(false);
        }
    }

    async function pollUnreadCount() {
        try {
            const count = await fetchUnreadChangesCount();
            if (count !== null) {
                setUnreadChangesCount(count);
            }
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (activeView === 'activity') {
            loadRecentChanges();
        }
    }, [activeView]);

    useEffect(() => {
        pollUnreadCount();
        const interval = setInterval(pollUnreadCount, 30_000);
        return () => clearInterval(interval);
    }, [activeView]);

    useEffect(() => {
        const previousCount = previousUnreadCountRef.current;

        if (!isUnreadNotificationReadyRef.current || previousCount === null) {
            previousUnreadCountRef.current = unreadChangesCount;
            isUnreadNotificationReadyRef.current = true;
            return;
        }

        if (unreadChangesCount > previousCount) {
            const newItems = unreadChangesCount - previousCount;
            const message = newItems === 1
                ? '1 yeni değişiklik eklendi.'
                : `${newItems} yeni değişiklik eklendi.`;

            triggerNotification('Proje Takip', {
                body: message,
                tag: 'project-changes',
                onClickAction: onNavigateToActivity,
            });
        }

        previousUnreadCountRef.current = unreadChangesCount;
    }, [unreadChangesCount, triggerNotification, onNavigateToActivity]);

    return {
        recentChanges,
        changesLoading,
        changesError,
        unreadChangesCount,
    };
}
