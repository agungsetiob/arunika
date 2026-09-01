import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { 
    Eye, Search, Download, Filter, 
    MapPin, Zap, Calendar, User, FileText, FileSpreadsheet
} from 'lucide-react';

// Tipe data berdasarkan Pagination Laravel
interface Report {
    id: number;
    damage_category: string;
    type: string;
    status: string;
    alamat_lengkap: string;
    created_at: string;
    user: {
        name: string;
        phone: string;
    };
}

interface PaginatedData {
    data: Report[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    reports: PaginatedData;
    filters: { search?: string; status?: string }; // Tambahkan Props filters
}

export default function Index({ reports, filters }: Props) {
    // 1. Inisialisasi State Pencarian & Filter
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const isFirstRender = useRef(true);

    // 2. Efek Debounce untuk Otomatis Mencari
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delay = setTimeout(() => {
            router.get(route('admin.reports.index'), { search, status }, { 
                preserveState: true, 
                preserveScroll: true, 
                replace: true 
            });
        }, 500); // Delay 0.5 detik saat mengetik

        return () => clearTimeout(delay);
    }, [search, status]);
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-red-50 text-red-600 border border-red-100',
            verified: 'bg-amber-50 text-amber-600 border border-amber-100',
            assigned: 'bg-sky-50 text-sky-600 border border-sky-100',
            in_progress: 'bg-blue-50 text-blue-600 border border-blue-100',
            completed: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
            rejected: 'bg-slate-100 text-slate-600 border border-slate-200',
        };
        return styles[status] || 'bg-slate-50 text-slate-600 border border-slate-200';
    };

    const formatCategory = (text: string) => {
        return text.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <AuthenticatedLayout header="Manajemen Laporan">
            <Head title="Daftar Laporan" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-2">
                <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    {/* INPUT PENCARIAN */}
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari ID, pelapor, atau alamat..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-shadow shadow-sm"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    {/* DROPDOWN FILTER STATUS */}
                    <div className="relative">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="appearance-none pl-10 pr-8 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <Filter className="absolute left-3 top-[11px] h-4 w-4 text-slate-500 pointer-events-none" />
                    </div>
                    
                    {/* TOMBOL EXPORT EXCEL (CSV) */}
                    <a 
                        href={route('admin.reports.export', { search, status })}
                        target="_blank"
                        className="flex items-center gap-2 bg-emerald-600 border border-transparent text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
                    >
                        <FileSpreadsheet className="h-4 w-4" /> Export Excel
                    </a>
                </div>
            </div>

            {/* Container Tabel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">Tiket</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Pelapor</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Detail Kerusakan</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Lokasi</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reports.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                <FileText className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium">Belum ada laporan masuk.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports.data.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                                        
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                                                #{report.id}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {report.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{report.user.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{report.user.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1">
                                                <Zap className={`h-3.5 w-3.5 ${report.type === 'pju' ? 'text-amber-500' : 'text-red-500'}`} />
                                                <span className={report.type === 'pju' ? 'text-amber-600' : 'text-red-600'}>
                                                    {report.type === 'pju' ? 'Penerangan (PJU)' : 'Traffic Light'}
                                                </span>
                                            </div>
                                            <div className="text-slate-700 font-medium">{formatCategory(report.damage_category)}</div>
                                        </td>
                                        
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="flex items-start gap-1.5">
                                                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                                <span className="text-sm text-slate-600 line-clamp-2" title={report.alamat_lengkap}>
                                                    {report.alamat_lengkap}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(report.status)}`}>
                                                {report.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-1">
                                                <Link
                                                    href={route('admin.reports.show', report.id)}
                                                    className="p-2 rounded-xl text-orange-600 hover:bg-orange-100 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                            </div>
                                        </td>
                                                                                
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {reports.total > 10 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                        <span className="text-sm text-slate-500">
                            Menampilkan <span className="font-bold text-slate-700">{reports.from}</span> - <span className="font-bold text-slate-700">{reports.to}</span> dari <span className="font-bold text-slate-700">{reports.total}</span> data
                        </span>
                        <div className="flex space-x-1">
                            {reports.links.map((link, index) => {
                                // Bersihkan label pagination (Previous/Next bawaan Laravel)
                                let label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                                
                                return link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                                            link.active 
                                                ? 'bg-orange-500 text-white shadow-sm' 
                                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-orange-600'
                                        }`}
                                    >
                                        {label}
                                    </Link>
                                ) : (
                                    <span 
                                        key={index} 
                                        className="flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                                    >
                                        {label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}