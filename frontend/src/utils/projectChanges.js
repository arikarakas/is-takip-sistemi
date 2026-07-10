export function getProjectAksiyonChanges(changes, projectId) {
    if (!Array.isArray(changes) || projectId == null) return [];

    return changes
        .filter((item) => item.project_id === projectId && item.changes?.aksiyon)
        .map((item) => {
            const aksiyonChange = item.changes.aksiyon;
            return {
                id: item.id,
                changed_at: item.changed_at,
                old_value: aksiyonChange?.old ?? null,
                new_value: aksiyonChange?.new ?? null,
                user: item.user ?? null,
            };
        });
}
