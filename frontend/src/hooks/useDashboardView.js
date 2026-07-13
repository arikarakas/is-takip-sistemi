import { useState, useEffect, useCallback } from 'react';
import {
    DEFAULT_VIEW,
    VIEW_SLUGS,
    viewFromSlug,
    slugFromView,
} from '../constants/views';

function readViewFromUrl() {
    const slug = new URLSearchParams(window.location.search).get('view');
    return viewFromSlug(slug);
}

function writeViewToUrl(view, { replace = false } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set('view', slugFromView(view));
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method](null, '', url);
}

export function useDashboardView() {
    const [activeView, setActiveView] = useState(readViewFromUrl);

    useEffect(() => {
        const slug = new URLSearchParams(window.location.search).get('view');
        const view = viewFromSlug(slug);

        if (slug !== slugFromView(view)) {
            writeViewToUrl(view, { replace: true });
        }
    }, []);

    useEffect(() => {
        const onPopState = () => setActiveView(readViewFromUrl());
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const navigateToView = useCallback((view, { replace = false } = {}) => {
        if (!VIEW_SLUGS[view]) return;

        setActiveView(view);
        writeViewToUrl(view, { replace });
    }, []);

    return { activeView, navigateToView };
}
