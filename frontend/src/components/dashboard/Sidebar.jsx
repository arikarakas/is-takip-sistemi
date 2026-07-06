import ShinyText from './ShinyText';

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
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                <polyline points="3 3 3 8 8 8"></polyline>
                                <line x1="12" y1="7" x2="12" y2="12"></line>
                                <line x1="12" y1="12" x2="16" y2="14"></line>
                            </svg>

                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
                                Son Değişiklikler
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                    <p className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden md:hidden'}`}>
                        Oturum Açan: <span className="font-bold text-slate-200">{currentUser?.full_name || currentUser?.username || '—'}</span>
                    </p>
                    <button
                        type="button"
                        onClick={onLogout}
                        title="Çıkış Yap"
                        className={`bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 py-2 rounded-lg font-semibold transition cursor-pointer flex items-center gap-2 ${
                            isOpen
                                ? 'mt-3 w-full px-3 justify-center'
                                : 'mt-0 md:mt-0 w-full md:w-10 md:h-10 md:p-0 md:justify-center'
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
