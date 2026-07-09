import { useEffect, useRef, useState } from 'react';
import { changePassword } from '../../utils/api';

function UserIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function roleLabel(role) {
    return role === 'admin' ? 'Admin' : 'Kullanıcı';
}

function UserProfileMenu({ currentUser, isSidebarOpen }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const menuRef = useRef(null);

    const displayName = currentUser?.full_name || currentUser?.username || '—';

    useEffect(() => {
        if (!isProfileOpen) return undefined;

        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                setIsProfileOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isProfileOpen]);

    useEffect(() => {
        if (!isProfileOpen) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError(null);
            setPasswordSuccess(null);
        }
    }, [isProfileOpen]);

    async function handlePasswordSubmit(event) {
        event.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Tüm şifre alanları zorunludur.');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('Yeni şifre en az 8 karakter olmalıdır.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Yeni şifreler eşleşmiyor.');
            return;
        }

        setIsChangingPassword(true);
        try {
            await changePassword(currentPassword, newPassword);
            setPasswordSuccess('Şifreniz başarıyla güncellendi.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordError(err.message || 'Şifre değiştirilemedi.');
        } finally {
            setIsChangingPassword(false);
        }
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                title="Profilim"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
                className={`w-full flex items-center gap-2 rounded-lg text-left transition cursor-pointer hover:bg-slate-800/60 hover:text-slate-200 ${
                    isSidebarOpen
                        ? 'px-2 py-1.5 justify-between'
                        : 'md:justify-center md:w-10 md:h-10 md:p-0 md:mx-auto'
                }`}
            >
                {!isSidebarOpen && (
                    <UserIcon className="w-4 h-4 shrink-0 text-slate-300" />
                )}
                <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100 flex-1 min-w-0' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
                    Oturum Açan: <span className="font-bold text-slate-200">{displayName}</span>
                </span>
                <span className={`text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''} ${isSidebarOpen ? '' : 'md:hidden'}`}>
                    ▾
                </span>
            </button>

            {isProfileOpen && (
                <div
                    className={`absolute bottom-full mb-2 z-50 rounded-xl border border-slate-700 bg-slate-800 shadow-xl shadow-black/40 animate-menu-slide-up origin-bottom ${
                        isSidebarOpen
                            ? 'left-0 right-0 w-full'
                            : 'left-0 md:left-full md:bottom-0 md:mb-0 md:ml-2 w-72 md:origin-bottom-left'
                    }`}
                >
                    <div className="p-4 border-b border-slate-700">
                        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                        {currentUser?.username && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate">@{currentUser.username}</p>
                        )}
                        {currentUser?.email && (
                            <p className="text-xs text-slate-400 mt-1 truncate">{currentUser.email}</p>
                        )}
                        {currentUser?.role && (
                            <span className="inline-block mt-2 rounded-md bg-slate-700/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                                {roleLabel(currentUser.role)}
                            </span>
                        )}
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="p-4 space-y-3">
                        <p className="text-xs font-semibold text-slate-300">Şifre Değiştir</p>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            placeholder="Mevcut şifre"
                            autoComplete="current-password"
                            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500"
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="Yeni şifre (min. 8 karakter)"
                            autoComplete="new-password"
                            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500"
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Yeni şifre tekrar"
                            autoComplete="new-password"
                            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500"
                        />
                        {passwordError && (
                            <p className="text-[11px] text-red-400">{passwordError}</p>
                        )}
                        {passwordSuccess && (
                            <p className="text-[11px] text-emerald-400">{passwordSuccess}</p>
                        )}
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-2 text-xs font-semibold text-white transition cursor-pointer"
                        >
                            {isChangingPassword ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default UserProfileMenu;
