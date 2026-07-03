import React, { useEffect, useState, useActionState } from 'react';
import { API_ROOT, getAuthHeaders, parseApiError } from '../../utils/api';

const USERS_API = `${API_ROOT}/users`;

async function fetchUsers() {
    const response = await fetch(`${USERS_API}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errorData.detail, 'Kullanıcılar yüklenemedi.'));
    }

    return response.json();
}

async function createUserAction(_prevState, formData) {
    const username = String(formData.get('username') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const fullName = String(formData.get('full_name') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const role = String(formData.get('role') ?? 'personel');

    if (!username || !email || !password) {
        return { error: 'Kullanıcı adı, e-posta ve şifre zorunludur.', success: false };
    }

    if (password.length < 8) {
        return { error: 'Şifre en az 8 karakter olmalıdır.', success: false };
    }

    const payload = { username, email, password, role };
    if (fullName) payload.full_name = fullName;

    try {
        const response = await fetch(`${USERS_API}/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                error: parseApiError(errorData.detail, 'Kullanıcı oluşturulamadı.'),
                success: false,
            };
        }

        return { success: true, error: null };
    } catch {
        return { error: 'Sunucuya bağlanılamadı.', success: false };
    }
}

async function updateUser(userId, updates) {
    const response = await fetch(`${USERS_API}/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errorData.detail, 'Kullanıcı güncellenemedi.'));
    }

    return response.json();
}

async function updateUserAction(_prevState, formData) {
    const userId = formData.get('userId');
    const email = String(formData.get('email') ?? '').trim();
    const fullName = String(formData.get('full_name') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const role = String(formData.get('role') ?? 'personel');

    if (!userId || !email) {
        return { error: 'E-posta zorunludur.', success: false };
    }

    if (password && password.length < 8) {
        return { error: 'Yeni şifre en az 8 karakter olmalıdır.', success: false };
    }

    const payload = { email, role, full_name: fullName || null };
    if (password) payload.password = password;

    try {
        await updateUser(userId, payload);
        return { success: true, error: null };
    } catch (err) {
        return { error: err.message || 'Kullanıcı güncellenemedi.', success: false };
    }
}

function roleLabel(role) {
    return role === 'admin' ? 'Admin' : 'Kullanıcı';
}

function UserManagement({ currentUser }) {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [formState, formAction, isPending] = useActionState(createUserAction, {
        success: false,
        error: null,
    });
    const [lastSubmittedAt, setLastSubmittedAt] = useState(0);
    const [editingUser, setEditingUser] = useState(null);
    const [editState, editAction, isEditPending] = useActionState(updateUserAction, {
        success: false,
        error: null,
    });
    const [editLastSubmittedAt, setEditLastSubmittedAt] = useState(0);

    async function loadUsers() {
        try {
            const data = await fetchUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (formState?.success && isFormOpen && lastSubmittedAt > 0) {
            loadUsers();
            setIsFormOpen(false);
            setLastSubmittedAt(0);
        }
    }, [formState?.success, isFormOpen, lastSubmittedAt]);

    useEffect(() => {
        if (editState?.success && editingUser && editLastSubmittedAt > 0) {
            loadUsers();
            setEditingUser(null);
            setEditLastSubmittedAt(0);
        }
    }, [editState?.success, editingUser, editLastSubmittedAt]);

    async function handleToggleActive(user) {
        if (user.id === currentUser?.id) {
            setActionError('Kendi hesabınızı pasifleştiremezsiniz.');
            return;
        }

        const nextActive = !user.is_active;
        const confirmed = window.confirm(
            `"${user.username}" kullanıcısını ${nextActive ? 'aktifleştirmek' : 'pasifleştirmek'} istediğinize emin misiniz?`,
        );
        if (!confirmed) return;

        setActionError(null);
        try {
            await updateUser(user.id, { is_active: nextActive });
            await loadUsers();
        } catch (err) {
            setActionError(err.message);
        }
    }

    return (
        <>
            <header className="mb-8">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kullanıcı Yönetimi</h1>
                    <button
                        type="button"
                        onClick={() => {
                            setIsFormOpen(true);
                            setActionError(null);
                        }}
                        className="self-start lg:self-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
                    >
                        + Yeni Kullanıcı Ekle
                    </button>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                    Yalnızca yöneticiler yeni kullanıcı oluşturabilir. Dışarıdan kayıt kapalıdır.
                </p>
            </header>

            {isLoading && <div className="text-center p-12 text-slate-500">Kullanıcılar yükleniyor...</div>}
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-4">Hata: {error}</div>}
            {actionError && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-4">{actionError}</div>}

            {!isLoading && !error && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Kullanıcı</th>
                                <th className="px-6 py-4">E-posta</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{user.username}</div>
                                        {user.full_name && (
                                            <div className="text-xs text-slate-400 mt-0.5">{user.full_name}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                            user.role === 'admin'
                                                ? 'bg-purple-50 text-purple-700'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {roleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                            user.is_active
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-red-50 text-red-600'
                                        }`}>
                                            {user.is_active ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingUser(user);
                                                    setActionError(null);
                                                }}
                                                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                            >
                                                Düzenle
                                            </button>
                                            {user.id !== currentUser?.id && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(user)}
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                                        user.is_active
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                >
                                                    {user.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Yeni Kullanıcı</h2>
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                aria-label="Kapat"
                            >
                                ✕
                            </button>
                        </div>

                        {formState?.error && (
                            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                                {formState.error}
                            </div>
                        )}

                        <form
                            action={formAction}
                            onSubmit={() => setLastSubmittedAt(Date.now())}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Kullanıcı Adı
                                </label>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    minLength={3}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    E-posta
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Ad Soyad
                                </label>
                                <input
                                    name="full_name"
                                    type="text"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Şifre
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Rol
                                </label>
                                <select
                                    name="role"
                                    defaultValue="personel"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                >
                                    <option value="personel">Kullanıcı</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {isPending ? 'Kaydediliyor...' : 'Kullanıcı Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Kullanıcı Düzenle</h2>
                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                aria-label="Kapat"
                            >
                                ✕
                            </button>
                        </div>

                        {editState?.error && (
                            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                                {editState.error}
                            </div>
                        )}

                        <form
                            key={`edit-${editingUser.id}`}
                            action={editAction}
                            onSubmit={() => setEditLastSubmittedAt(Date.now())}
                            className="space-y-4"
                        >
                            <input type="hidden" name="userId" value={editingUser.id} />

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Kullanıcı Adı
                                </label>
                                <input
                                    type="text"
                                    value={editingUser.username}
                                    disabled
                                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    E-posta
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    defaultValue={editingUser.email}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Ad Soyad
                                </label>
                                <input
                                    name="full_name"
                                    type="text"
                                    defaultValue={editingUser.full_name ?? ''}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Yeni Şifre
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    minLength={8}
                                    placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Rol
                                </label>
                                {editingUser.id === currentUser?.id ? (
                                    <>
                                        <input type="hidden" name="role" value={editingUser.role} />
                                        <input
                                            type="text"
                                            value={roleLabel(editingUser.role)}
                                            disabled
                                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                                        />
                                        <p className="mt-1.5 text-xs text-slate-400">
                                            Kendi rolünüzü değiştiremezsiniz.
                                        </p>
                                    </>
                                ) : (
                                    <select
                                        name="role"
                                        defaultValue={editingUser.role}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                    >
                                        <option value="personel">Kullanıcı</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isEditPending}
                                    className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {isEditPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default UserManagement;
