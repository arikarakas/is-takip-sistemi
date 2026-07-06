import { formatDateTR } from '../../utils/date';

const ACTION_LABELS = {
    created: 'Oluşturuldu',
    updated: 'Güncellendi',
};

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

function formatChangeSummary(changes) {
    if (!changes || typeof changes !== 'object') return '—';

    return Object.entries(changes)
        .filter(([key]) => key !== 'title')
        .map(([field, value]) => {
            if (value && typeof value === 'object' && 'old' in value && 'new' in value) {
                return `${field}: ${value.old ?? '—'} → ${value.new ?? '—'}`;
            }
            return `${field}: ${String(value)}`;
        })
        .join(', ') || '—';
}

export default function RecentChangesTable({ changes, isLoading, error }) {
    if (isLoading) {
        return <p className="text-slate-500">Yükleniyor...</p>;
    }

    if (error) {
        return <p className="text-red-600">{error}</p>;
    }

    if (!changes.length) {
        return <p className="text-slate-500">Henüz kayıtlı değişiklik yok.</p>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-5 py-3">Zaman</th>
                            <th className="px-5 py-3">Kullanıcı</th>
                            <th className="px-5 py-3">İşlem</th>
                            <th className="px-5 py-3">Proje</th>
                            <th className="px-5 py-3">Detay</th>
                        </tr>
                    </thead>
                    <tbody>
                        {changes.map((item) => (
                            <tr key={item.id} className="border-t border-slate-100">
                                <td className="px-5 py-3 whitespace-nowrap text-slate-600">
                                    {formatDateTime(item.changed_at)}
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    {item.user?.full_name || item.user?.username || '—'}
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    {ACTION_LABELS[item.action] || item.action}
                                </td>
                                <td className="px-5 py-3">
                                    {item.project_title || '—'}
                                </td>
                                <td className="px-5 py-3 text-slate-500">
                                    {formatChangeSummary(item.changes)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}