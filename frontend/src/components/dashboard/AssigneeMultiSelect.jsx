import { useEffect, useMemo, useRef, useState } from 'react';
import { API_ROOT, apiFetch, getAuthHeaders, parseApiError } from '../../utils/api';
import { LABEL_CLASS_NAME } from '../../constants/projects';

function userLabel(user) {
    return user.full_name?.trim() || user.username;
}

function buildInitialSelection(initialAssignments = [], users = [], fallbackSorumlular = '') {
    const selectedUsers = [];
    const customNames = [];

    for (const assignment of initialAssignments) {
        if (assignment.assigned_user_id != null) {
            const matched = users.find((user) => user.id === assignment.assigned_user_id);
            if (matched) {
                selectedUsers.push(matched);
            } else {
                selectedUsers.push({
                    id: assignment.assigned_user_id,
                    username: `Kullanıcı #${assignment.assigned_user_id}`,
                    full_name: null,
                });
            }
        } else if (assignment.assigned_custom_name?.trim()) {
            customNames.push(assignment.assigned_custom_name.trim());
        }
    }

    if (selectedUsers.length === 0 && customNames.length === 0 && fallbackSorumlular) {
        customNames.push(
            ...fallbackSorumlular
                .split(',')
                .map((name) => name.trim())
                .filter(Boolean),
        );
    }

    return { selectedUsers, customNames };
}

function AssigneeMultiSelect({
    initialAssignments = [],
    fallbackSorumlular = '',
    label = 'İŞTEN SORUMLU KİŞİ(LER) *',
}) {
    const [users, setUsers] = useState([]);
    const [loadError, setLoadError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState(() => (
        buildInitialSelection(initialAssignments, [], fallbackSorumlular).selectedUsers
    ));
    const [customNames, setCustomNames] = useState(() => (
        buildInitialSelection(initialAssignments, [], fallbackSorumlular).customNames
    ));
    const rootRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        async function loadUsers() {
            setIsLoading(true);
            setLoadError(null);
            try {
                const response = await apiFetch(`${API_ROOT}/users/brief`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                    cache: 'no-store',
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(parseApiError(errorData.detail, 'Kullanıcı listesi alınamadı.'));
                }
                const data = await response.json();
                if (!cancelled) {
                    setUsers(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err.message || 'Kullanıcı listesi alınamadı.');
                    setUsers([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadUsers();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (isLoading || users.length === 0) return;
        const next = buildInitialSelection(initialAssignments, users, fallbackSorumlular);
        setSelectedUsers(next.selectedUsers);
        setCustomNames(next.customNames);
    }, [isLoading, users, initialAssignments, fallbackSorumlular]);

    useEffect(() => {
        if (!isOpen) return undefined;

        function handlePointerDown(event) {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isOpen]);

    const selectedUserIds = useMemo(
        () => new Set(selectedUsers.map((user) => user.id)),
        [selectedUsers],
    );

    const filteredUsers = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return users;
        return users.filter((user) => {
            const labelText = userLabel(user).toLowerCase();
            const username = (user.username || '').toLowerCase();
            return labelText.includes(normalized) || username.includes(normalized);
        });
    }, [users, query]);

    const sorumlularText = useMemo(() => {
        const names = [
            ...selectedUsers.map(userLabel),
            ...customNames,
        ].filter(Boolean);
        return names.join(', ');
    }, [selectedUsers, customNames]);

    function toggleUser(user) {
        setSelectedUsers((prev) => {
            if (prev.some((item) => item.id === user.id)) {
                return prev.filter((item) => item.id !== user.id);
            }
            return [...prev, user];
        });
    }

    function removeUser(userId) {
        setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
    }

    function removeCustomName(name) {
        setCustomNames((prev) => prev.filter((item) => item !== name));
    }

    function addCustomName() {
        const name = query.trim();
        if (!name) return;
        const existsAsUser = users.some(
            (user) => userLabel(user).toLowerCase() === name.toLowerCase()
                || (user.username || '').toLowerCase() === name.toLowerCase(),
        );
        if (existsAsUser) {
            const matched = users.find(
                (user) => userLabel(user).toLowerCase() === name.toLowerCase()
                    || (user.username || '').toLowerCase() === name.toLowerCase(),
            );
            if (matched) toggleUser(matched);
            setQuery('');
            return;
        }
        setCustomNames((prev) => {
            if (prev.some((item) => item.toLowerCase() === name.toLowerCase())) {
                return prev;
            }
            return [...prev, name];
        });
        setQuery('');
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addCustomName();
        } else if (event.key === 'Escape') {
            setIsOpen(false);
        }
    }

    const hasSelection = selectedUsers.length > 0 || customNames.length > 0;

    return (
        <div ref={rootRef} className="relative md:col-span-2">
            <label className={LABEL_CLASS_NAME}>{label}</label>

            <input type="hidden" name="sorumlular" value={sorumlularText} />
            {selectedUsers.map((user) => (
                <input key={`user-${user.id}`} type="hidden" name="assigned_user_ids" value={user.id} />
            ))}
            {customNames.map((name) => (
                <input key={`custom-${name}`} type="hidden" name="assigned_custom_names" value={name} />
            ))}

            <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white">
                <div className="flex flex-wrap gap-2 px-3 pt-3">
                    {selectedUsers.map((user) => (
                        <span
                            key={`chip-user-${user.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100"
                        >
                            {userLabel(user)}
                            <button
                                type="button"
                                onClick={() => removeUser(user.id)}
                                className="text-blue-400 hover:text-blue-700 cursor-pointer"
                                aria-label={`${userLabel(user)} kaldır`}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                    {customNames.map((name) => (
                        <span
                            key={`chip-custom-${name}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-100"
                        >
                            {name}
                            <button
                                type="button"
                                onClick={() => removeCustomName(name)}
                                className="text-amber-400 hover:text-amber-700 cursor-pointer"
                                aria-label={`${name} kaldır`}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                    {!hasSelection && !isLoading && (
                        <span className="text-xs text-slate-400 py-1">Kişi seçin veya özel isim yazın</span>
                    )}
                </div>

                <div className="flex items-center gap-2 px-3 py-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={isLoading ? 'Kullanıcılar yükleniyor...' : 'Ara veya özel isim ekle'}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={addCustomName}
                        disabled={!query.trim()}
                        className="shrink-0 rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-300 disabled:opacity-40 cursor-pointer"
                    >
                        Ekle
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="shrink-0 text-slate-400 hover:text-slate-600 cursor-pointer text-sm"
                        aria-label="Listeyi aç/kapat"
                    >
                        {isOpen ? '▴' : '▾'}
                    </button>
                </div>
            </div>

            {loadError && (
                <p className="mt-1.5 text-xs text-amber-600">
                    {loadError} Özel isim eklemeye devam edebilirsiniz.
                </p>
            )}

            {isOpen && (
                <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {filteredUsers.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-slate-500">
                            {query.trim()
                                ? `"${query.trim()}" için kayıtlı kullanıcı yok. Enter veya Ekle ile özel isim ekleyebilirsiniz.`
                                : 'Kayıtlı aktif kullanıcı bulunamadı.'}
                        </div>
                    ) : (
                        <ul className="py-1">
                            {filteredUsers.map((user) => {
                                const checked = selectedUserIds.has(user.id);
                                return (
                                    <li key={user.id}>
                                        <button
                                            type="button"
                                            onClick={() => toggleUser(user)}
                                            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-50 cursor-pointer ${
                                                checked ? 'bg-blue-50/60' : ''
                                            }`}
                                        >
                                            <span>
                                                <span className="font-medium text-slate-800">{userLabel(user)}</span>
                                                {user.full_name ? (
                                                    <span className="ml-2 text-xs text-slate-400">@{user.username}</span>
                                                ) : null}
                                            </span>
                                            <span className={`text-xs font-bold ${checked ? 'text-blue-600' : 'text-slate-300'}`}>
                                                {checked ? '✓' : '+'}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default AssigneeMultiSelect;
