import { useEffect, useState } from 'react';
import { API_ROOT, apiFetch, getAuthHeaders, parseApiError } from '../../utils/api';
import { getProjectAksiyonChanges } from '../../utils/projectChanges';

function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ProjectAksiyonHistory({ projectId, isActive }) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isActive || !projectId) return undefined;

        let cancelled = false;

        async function loadHistory() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await apiFetch(`${API_ROOT}/projects/changes/recent?limit=100`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                    cache: 'no-store',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(parseApiError(errorData.detail, 'Aksiyon geçmişi yüklenemedi.'));
                }

                const data = await response.json();
                if (!cancelled) {
                    setItems(getProjectAksiyonChanges(data, projectId));
                }
            } catch (err) {
                if (!cancelled) {
                    setItems([]);
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadHistory();

        return () => {
            cancelled = true;
        };
    }, [projectId, isActive]);

    if (isLoading) {
        return <p className="px-4 py-2 text-sm text-slate-500">Aksiyon geçmişi yükleniyor...</p>;
    }

    if (error) {
        return <p className="px-4 py-2 text-sm text-red-600">{error}</p>;
    }

    if (!items.length) {
        return <p className="px-4 py-2 text-sm text-slate-500">Bu proje için kayıtlı aksiyon değişikliği yok.</p>;
    }

    return (
        <nav className="flex flex-col divide-y divide-amber-100/80">
            {items.map((item) => (
                <p key={item.id} className="px-4 py-2 text-sm text-slate-700 hover:bg-amber-50/50 transition-colors">
                    <time dateTime={item.changed_at} className="font-semibold tabular-nums text-amber-800 mr-3">
                        {formatDateTime(item.changed_at)}
                    </time>
                    <span className="whitespace-pre-wrap">{item.old_value || '—'}</span>
                </p>
            ))}
        </nav>
    );
}
