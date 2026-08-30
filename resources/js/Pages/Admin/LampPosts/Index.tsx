import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { 
    Search, Filter, Plus, Lightbulb, 
    MapPin, Zap, Edit, Trash2, FileSpreadsheet
} from 'lucide-react';
import ConfirmModal from '@/Components/ConfirmModal';

interface LampPost {
    id: number;
    code_tiang: string;
    type: string;
    lat: string;
    lng: string;
    alamat: string;
    status_lampu: string;
}

interface PaginatedData {
    data: LampPost[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    lampPosts: PaginatedData;
    filters: { search?: string; status_lampu?: string };
}

export default function Index({ lampPosts, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusLampu, setStatusLampu] = useState(filters?.status_lampu || '');
    const isFirstRender = useRef(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [lampToDelete, setLampToDelete] = useState<number | null>(null);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delay = setTimeout(() => {
            router.get(route('admin.lamp-posts.index'), { search, status_lampu: statusLampu }, { 
                preserveState: true, 
                preserveScroll: true, 
                replace: true 
            });
        }, 500);

        return () => clearTimeout(delay);
    }, [search, statusLampu]);
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
            broken: 'bg-red-50 text-red-600 border border-red-100',
            maintenance: 'bg-amber-50 text-amber-600 border border-amber-100',
        };
        return styles[status] || 'bg-slate-50 text-slate-600 border border-slate-200';
    };

    const formatType = (type: string) => {
        return type === 'pju' ? 'PJU (Penerangan)' : 'Traffic Light';
    };

    return (
        <AuthenticatedLayout header="Master Lampu">
            <Head title="Master Lampu" />

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
                        placeholder="Cari kode lampu, jalan, atau kecamatan..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-shadow shadow-sm"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    {/* DROPDOWN FILTER STATUS */}
                    <div className="relative">
                        <select
                            value={statusLampu}
                            onChange={(e) => setStatusLampu(e.target.value)}
                            className="appearance-none pl-10 pr-8 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif (Menyala)</option>
                            <option value="maintenance">Pemeliharaan</option>
                            <option value="broken">Rusak / Mati</option>
                        </select>
                        <Filter className="absolute left-3 top-[11px] h-4 w-4 text-slate-500 pointer-events-none" />
                    </div>

                    <a 
                        href={route('admin.lamp-posts.export', { search, status_lampu: statusLampu })}
                        target="_blank"
                        className="flex items-center gap-2 bg-emerald-600 border border-transparent text-white px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
                        title="Export Excel"
                    >
                        <FileSpreadsheet className="h-4 w-4" /> <span className="hidden sm:inline">Excel</span>
                    </a>

                    <Link 
                        href={route('admin.lamp-posts.create')}
                        className="flex items-center gap-2 bg-orange-600 border border-transparent text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors shadow-md shadow-orange-500/20"
                    >
                        <Plus className="h-5 w-5" /> Tambah Baru
                    </Link>
                </div>
            </div>

            {/* Container Tabel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">Kode & Tipe</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Lokasi / Alamat</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Koordinat</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {lampPosts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center mb-3">
                                                <Lightbulb className="h-8 w-8 text-orange-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium">Belum ada data Master Lampu.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                lampPosts.data.map((lamp) => (
                                    <tr key={lamp.id} className="hover:bg-slate-50/50 transition-colors group">
                                        
                                        {/* Kode & Tipe */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                                                    lamp.type === 'pju' ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-red-50 border-red-100 text-red-500'
                                                }`}>
                                                    <Zap className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-800">{lamp.code_tiang}</div>
                                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                                                        {formatType(lamp.type)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Lokasi Alamat */}
                                        <td className="px-6 py-4 max-w-[250px]">
                                            <div className="flex items-start gap-1.5">
                                                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                                <span className="text-sm text-slate-600 line-clamp-2" title={lamp.alamat}>
                                                    {lamp.alamat || <span className="italic text-slate-400">Alamat tidak dicatat</span>}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        {/* Koordinat GPS */}
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-mono bg-slate-50 px-2 py-1 rounded text-slate-500 inline-block border border-slate-100">
                                                {parseFloat(lamp.lat).toFixed(5)}, {parseFloat(lamp.lng).toFixed(5)}
                                            </div>
                                        </td>
                                        
                                        {/* Status */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(lamp.status_lampu)}`}>
                                                {lamp.status_lampu}
                                            </span>
                                        </td>
                                        
                                        {/* Aksi (Edit & Delete) */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route('admin.lamp-posts.edit', lamp.id)}
                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 bg-white border border-blue-200 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50 transition-all shadow-sm"
                                                    title="Edit Data"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                
                                                <button
                                                    onClick={() => {
                                                        setLampToDelete(lamp.id);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 bg-white border border-red-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                                                    title="Hapus Data"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {lampPosts?.total > 10 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                        <span className="text-sm text-slate-500">
                            Menampilkan <span className="font-bold text-slate-700">{lampPosts.from}</span> - <span className="font-bold text-slate-700">{lampPosts.to}</span> dari <span className="font-bold text-slate-700">{lampPosts.total}</span> data
                        </span>
                        <div className="flex space-x-1">
                            {lampPosts.links.map((link, index) => {
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

                <ConfirmModal 
                    isOpen={isDeleteModalOpen}
                    title="Hapus Master Lampu"
                    message="Apakah Anda yakin ingin menghapus data tiang/lampu ini? Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi laporan terkait."
                    confirmText="Ya, Hapus Data"
                    confirmColor="red"
                    onCancel={() => {
                        setIsDeleteModalOpen(false);
                        setLampToDelete(null);
                    }}
                    onConfirm={() => {
                        if (lampToDelete) {
                            router.delete(route('admin.lamp-posts.destroy', lampToDelete), {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setIsDeleteModalOpen(false);
                                    setLampToDelete(null);
                                }
                            });
                        }
                    }}
                />
            </div>
        </AuthenticatedLayout>
    );
}