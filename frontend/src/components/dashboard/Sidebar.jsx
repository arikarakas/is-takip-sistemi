import ShinyText from './ShinyText';
import UserProfileMenu from './UserProfileMenu';

function ChevronIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    );
}

function MenuIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function LogoutIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

function Sidebar({ onLogout, isOpen, onToggle, currentUser, activeView, onNavigate, isAdmin }) {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onToggle}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    h-screen
                    bg-slate-900 text-white
                    flex flex-col justify-between
                    transition-all duration-300 ease-in-out
                    ${isOpen
                        ? 'w-64 translate-x-0'
                        : '-translate-x-full w-64 md:translate-x-0 md:w-18'
                    }
                `}
            >
                <div className={`p-6 flex-1 flex flex-col ${isOpen ? '' : 'md:px-3 md:items-center'}`}>
                    <div className={`flex items-center mb-8 gap-2 ${isOpen ? 'justify-between' : 'md:justify-center'}`}>
                        <h2
                            className={`text-xl font-black tracking-tight whitespace-nowrap transition-all duration-300 ${
                                isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:hidden'
                            }`}
                        >
                            <ShinyText
                                text="İş Takip Paneli"
                                speed={2.5}
                                color="#60a5fa"
                                shineColor="#ffffff"
                                spread={120}
                                direction="left"
                                className="text-xl font-black tracking-tight"
                            />
                        </h2>
                        <button
                            type="button"
                            onClick={onToggle}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
                            aria-label={isOpen ? 'Kenar çubuğunu kapat' : 'Kenar çubuğunu aç'}
                        >
                            <ChevronIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
                        </button>
                    </div>

                    <nav className={`space-y-2 ${isOpen ? '' : 'md:w-full'}`}>
                        <button
                            type="button"
                            onClick={() => onNavigate?.('projects')}
                            title="Proje Listesi"
                            className={`w-full flex items-center gap-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                                isOpen ? 'px-4' : 'md:px-0 md:justify-center md:w-full'
                            } ${
                                activeView === 'projects'
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                <line x1="6" y1="11" x2="14" y2="11"></line>
                                <line x1="6" y1="15" x2="18" y2="15"></line>
                            </svg>

                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
                                Proje Listesi
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate?.('activity')}
                            title="Son Değişiklikler"
                            className={`w-full flex items-center gap-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                                isOpen ? 'px-4' : 'md:px-0 md:justify-center md:w-full'
                            } ${
                                activeView === 'activity'
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                <polyline points="3 3 3 8 8 8"></polyline>
                                <line x1="12" y1="7" x2="12" y2="12"></line>
                                <line x1="12" y1="12" x2="16" y2="14"></line>
                            </svg>

                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
                                Son Değişiklikler
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate?.('assigned')}
                            title="Bana Atananlar"
                            className={`w-full flex items-center gap-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                                isOpen ? 'px-4' : 'md:px-0 md:justify-center md:w-full'
                            } ${
                                activeView === 'assigned'
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            }`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M16 4C16.93 4 17.395 4 17.7765 4.10222C18.8117 4.37962 19.6204 5.18827 19.8978 6.22354C20 6.60504 20 7.07003 20 8V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V8C4 7.07003 4 6.60504 4.10222 6.22354C4.37962 5.18827 5.18827 4.37962 6.22354 4.10222C6.60504 4 7.07003 4 8 4M9.6 6H14.4C14.9601 6 15.2401 6 15.454 5.89101C15.6422 5.79513 15.7951 5.64215 15.891 5.45399C16 5.24008 16 4.96005 16 4.4V3.6C16 3.03995 16 2.75992 15.891 2.54601C15.7951 2.35785 15.6422 2.20487 15.454 2.10899C15.2401 2 14.9601 2 14.4 2H9.6C9.03995 2 8.75992 2 8.54601 2.10899C8.35785 2.20487 8.20487 2.35785 8.10899 2.54601C8 2.75992 8 3.03995 8 3.6V4.4C8 4.96005 8 5.24008 8.10899 5.45399C8.20487 5.64215 8.35785 5.79513 8.54601 5.89101C8.75992 6 9.03995 6 9.6 6Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
                                Bana Atananlar
                            </span>
                        </button>

                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => onNavigate?.('users')}
                                title="Kullanıcı Yönetimi"
                                className={`w-full flex items-center gap-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                                    isOpen ? 'px-4' : 'md:px-0 md:justify-center md:w-full'
                                } ${
                                    activeView === 'users'
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>

                                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
                                    Kullanıcı Yönetimi
                                </span>
                            </button>
                        )}
                    </nav>
                </div>

                <div className={`p-6 pt-4 border-t border-slate-800 text-xs text-slate-400 ${isOpen ? '' : 'md:px-3'}`}>
                    <UserProfileMenu currentUser={currentUser} isSidebarOpen={isOpen} />
                    <button
                        type="button"
                        onClick={onLogout}
                        title="Çıkış Yap"
                        className={`bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 py-2 rounded-lg font-semibold transition cursor-pointer flex items-center gap-2 ${
                            isOpen
                                ? 'mt-3 w-full px-3 justify-center'
                                : 'mt-3 md:mt-3 w-full md:w-10 md:h-10 md:p-0 md:justify-center md:mx-auto'
                        }`}
                    >
                        <LogoutIcon className="w-4 h-4 shrink-0" />
                        <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
                            Çıkış Yap
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export { MenuIcon };
export default Sidebar;
