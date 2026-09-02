import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FileText,
    Lightbulb,
    Menu,
    ChevronDown,
    LogOut,
    User,
    X,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const { flash } = usePage<any>().props;
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }

        if (flash?.success || flash?.error) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const navItems = [
        { name: 'Dashboard', href: 'admin.dashboard', icon: LayoutDashboard, pattern: 'admin.dashboard' },
        { name: 'Data Laporan', href: 'admin.reports.index', icon: FileText, pattern: 'admin.reports.*' },
        { name: 'Master Lampu', href: 'admin.lamp-posts.index', icon: Lightbulb, pattern: 'admin.lamp-posts.*' },
        { name: 'Manajemen User', href: 'admin.users.index', icon: User, pattern: 'admin.users.*' },
    ];

    const renderSidebarContent = () => (
        <div className="flex h-full flex-col bg-white">
            <div className="flex h-20 shrink-0 items-center gap-4 px-6 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 shadow-md shadow-orange-500/20">
                    <Lightbulb className="h-5 w-5 text-white" />
                </div>

                <div className="flex flex-col">
                    <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                        ARUNIKA
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500 mt-1">
                        Smart PJU System
                    </span>
                </div>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
                <ul className="space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = route().current(item.pattern);

                        return (
                            <li key={item.name}>
                                <Link
                                    href={route(item.href)}
                                    className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${
                                        isActive
                                            ? 'bg-orange-600 text-white shadow-md shadow-slate-900/10'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <item.icon
                                        className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                                            !isActive && 'group-hover:scale-110'
                                        } ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-500'}`}
                                    />

                                    <span
                                        className={`${!isActive && 'group-hover:translate-x-1'} transition-transform duration-300`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="mt-auto p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                        {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex flex-col overflow-hidden">
                        <p className="text-xs font-medium text-slate-500">Administrator</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f4f7f9] font-sans selection:bg-orange-500 selection:text-white">
            <div
                className={`fixed inset-0 z-50 lg:hidden ${
                    isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
            >
                <div
                    className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
                        isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                <div
                    className={`fixed inset-y-0 left-0 flex w-72 max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
                        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <button
                        type="button"
                        className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="h-5 w-5 text-slate-700 transition-transform duration-300 hover:rotate-90" />
                    </button>

                    {renderSidebarContent()}
                </div>
            </div>

            <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-200/60 bg-white">
                {renderSidebarContent()}
            </div>

            <div className="lg:pl-72 flex flex-col min-h-screen">
                <div className="sticky top-0 z-30 flex h-20 items-center gap-x-4 bg-white/70 backdrop-blur-xl px-4 sm:px-6 lg:px-8 border-b border-slate-200/50 transition-all">
                    <button
                        className="lg:hidden -m-2.5 p-2.5 text-slate-700 hover:text-slate-900 rounded-lg bg-white shadow-sm border border-slate-100"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {header && (
                        <div className="hidden sm:block flex-1">
                            <h1 className="text-xl font-bold text-slate-800">{header}</h1>
                        </div>
                    )}

                    <div className="flex flex-1 items-center justify-end gap-x-6">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="group flex items-center gap-x-3 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:shadow-md transition-all">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 text-xs font-bold text-white shadow-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>

                                    <span className="hidden sm:inline-block">
                                        {user.name.split(' ')[0]}
                                    </span>

                                    <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content width="48">
                                <Dropdown.Link
                                    href={route('profile.edit')}
                                    className="flex items-center text-slate-700 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                                >
                                    <User className="mr-2 h-4 w-4" /> Profil Saya
                                </Dropdown.Link>

                                <div className="border-t border-slate-100 my-1"></div>

                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                                >
                                    <LogOut className="mr-2 h-4 w-4" /> Keluar
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>

                {header && (
                    <header className="sm:hidden px-4 py-4 sm:px-6 lg:px-8">
                        <h1 className="text-xl font-bold text-slate-800">{header}</h1>
                    </header>
                )}

                <main className="flex-1">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>

                <footer className="mt-auto px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-sm text-slate-800 sm:flex-row">
                        <p>© 2026 - {new Date().getFullYear()} ARUNIKA Dinas Perhubungan</p>
                    </div>
                </footer>
            </div>

            {toast && (
                <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-top-5 fade-in duration-300">
                    <div className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-slate-900/20 flex items-center gap-3">
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                        )}

                        <span className="text-sm font-bold">{toast.message}</span>

                        <button
                            onClick={() => setToast(null)}
                            className="ml-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}