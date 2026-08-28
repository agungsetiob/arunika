import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

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
}

export default function Index({ reports }: Props) {
    // Helper untuk warna badge status
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-red-100 text-red-800',
            verified: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            rejected: 'bg-gray-100 text-gray-800',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const formatCategory = (text: string) => {
        return text.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manajemen Laporan</h2>}
        >
            <Head title="Daftar Laporan" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 border-b border-gray-200">
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3">ID</th>
                                            <th className="px-6 py-3">Pelapor</th>
                                            <th className="px-6 py-3">Jenis & Kategori</th>
                                            <th className="px-6 py-3">Lokasi</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Tanggal</th>
                                            <th className="px-6 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                                    Belum ada laporan masuk.
                                                </td>
                                            </tr>
                                        ) : (
                                            reports.data.map((report) => (
                                                <tr key={report.id} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        #{report.id}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold">{report.user.name}</div>
                                                        <div className="text-xs text-gray-500">{report.user.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold uppercase text-xs mb-1">
                                                            {report.type === 'pju' ? 'Lampu Jalan' : 'Lampu Merah'}
                                                        </div>
                                                        <div>{formatCategory(report.damage_category)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 truncate max-w-[200px]" title={report.alamat_lengkap}>
                                                        {report.alamat_lengkap}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${getStatusBadge(report.status)}`}>
                                                            {report.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {new Date(report.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Link
                                                            href={route('admin.reports.show', report.id)}
                                                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                                        >
                                                            Detail
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination (Sederhana) */}
                            {reports.total > 10 && (
                                <div className="flex items-center justify-between mt-4 px-4">
                                    <span className="text-sm text-gray-700">
                                        Menampilkan <span className="font-semibold">{reports.from}</span> - <span className="font-semibold">{reports.to}</span> dari <span className="font-semibold">{reports.total}</span> data
                                    </span>
                                    <div className="flex space-x-1">
                                        {reports.links.map((link, index) => (
                                            link.url ? (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`px-3 py-1 border rounded text-sm ${link.active ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white hover:bg-gray-50'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span 
                                                    key={index} 
                                                    className="px-3 py-1 border rounded text-sm text-gray-400 bg-gray-50"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}