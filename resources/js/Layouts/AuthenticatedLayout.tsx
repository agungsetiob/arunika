import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import {
    LayoutDashboard,
    FileText,
    Lightbulb,
    Menu,
    ChevronDown,
    LogOut,
    User
} from 'lucide-react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: 'admin.dashboard', icon: LayoutDashboard, pattern: 'admin.dashboard' },
        { name: 'Data Laporan', href: 'admin.reports.index', icon: FileText, pattern: 'admin.reports.*' },
        { name: 'Master Tiang', href: 'admin.lamp-posts.index', icon: Lightbulb, pattern: 'admin.lamp-posts.*' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-orange-500 selection:text-white">
            {/* Sidebar Desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-slate-200/60 bg-white px-6 py-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                    <div className="flex shrink-0 items-center gap-4 px-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                            <Lightbulb className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">ARUNIKA</span>
                            <span className="text- font-bold uppercase tracking-[0.2em] text-orange-500 mt-1">Smart PJU System</span>
                        </div>
                    </div>

                    <nav className="flex flex-1 flex-col mt-4">
                        <ul className="-mx-2 space-y-2">
                            {navItems.map((item) => {
                                const isActive = route().current(item.pattern);
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={route(item.href)}
                                            className={`group flex items-center gap-x-3.5 rounded-2xl p-3.5 text-sm font-semibold transition-all duration-300 ${isActive? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                                        >
                                            <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`} />
                                            <span className={`${!isActive && 'group-hover:translate-x-0.5'} transition-transform duration-300`}>{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="mt-auto px-2 pb-4">
                        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-900/5">
                            <p className="text-xs font-medium text-slate-500">Masuk sebagai</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:pl-72 flex flex-col min-h-screen">
                <div className="sticky top-0 z-40 flex h-20 items-center gap-x-4 border-b border-slate-200/50 bg-white/70 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
                    <button className="lg:hidden -m-2.5 p-2.5 text-slate-700 rounded-lg" onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}>
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex flex-1 items-center justify-end gap-x-6">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="group flex items-center gap-x-3 rounded-full bg-white p-1 pr-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-50 hover:shadow-md transition-all">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="hidden sm:inline-block">{user.name.split(' ')[0]}</span>
                                    <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content width="48">
                                <Dropdown.Link href={route('profile.edit')}><User className="mr-2 h-4 w-4 inline" /> Profile Settings</Dropdown.Link>
                                <div className="border-t border-slate-100 my-1"></div>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="text-red-600 hover:bg-red-50"><LogOut className="mr-2 h-4 w-4 inline" /> Log Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>

                {/* MOBILE */}
                <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${showingNavigationDropdown? 'max-h-96 border-b shadow-lg' : 'max-h-0'}`}>
                    <div className="bg-white px-4 py-4 space-y-2">
                        {navItems.map((item) => (
                            <ResponsiveNavLink key={item.name} href={route(item.href)} active={route().current(item.pattern)}>
                                <div className="flex items-center gap-3"><item.icon className="h-5 w-5" /> {item.name}</div>
                            </ResponsiveNavLink>
                        ))}
                        <div className="border-t border-slate-100 pt-2 mt-2">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-red-600">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>

                {header && (
                    <header className="bg-white/50 backdrop-blur-sm border-b border-slate-200/60">
                        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                <main className="flex-1 py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
                </main>
            </div>
        </div>
    );
}