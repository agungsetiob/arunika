import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FormEvent, useState } from 'react';

export default function Show({ report, petugas }: any) {
    const { data, setData, post, processing, reset } = useForm({
        notes: '',
        petugas_id: ''
    });

    const [showRejectForm, setShowRejectForm] = useState(false);

    // Helper warna status
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

    const handleVerify = () => {
        if(confirm('Yakin ingin memverifikasi laporan ini?')) {
            post(route('admin.reports.verify', report.id));
        }
    };

    const handleReject = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.reports.reject', report.id), {
            onSuccess: () => setShowRejectForm(false)
        });
    };

    const handleAssign = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.reports.assign', report.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Detail Laporan #{report.id}
                    </h2>
                    <Link href={route('admin.reports.index')} className="text-sm text-gray-600 hover:text-gray-900 underline">
                        &larr; Kembali ke Daftar
                    </Link>
                </div>
            }
        >
            <Head title={`Detail Laporan #${report.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Kolom Kiri: Detail & Peta (Lebih Lebar) */}
                    <div className="md:col-span-2 space-y-6">
                        
                        {/* Panel Info Laporan */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                        {report.type === 'pju' ? 'Lampu Jalan' : 'Lampu Merah'} - {report.damage_category.replace('_', ' ').toUpperCase()}
                                    </h3>
                                    <p className="text-sm text-gray-500">Dilaporkan oleh: {report.user.name} ({report.user.phone})</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${getStatusBadge(report.status)}`}>
                                    {report.status}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Deskripsi Laporan</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-100">
                                    {report.description || 'Tidak ada deskripsi tambahan.'}
                                </p>
                            </div>

                            {/* Foto Laporan */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Foto Kondisi</h4>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {report.media && report.media.length > 0 ? (
                                        report.media.map((img: any) => (
                                            <div key={img.id} className="min-w-[150px] h-32 bg-gray-100 rounded-md border flex items-center justify-center overflow-hidden">
                                                {/* Menggunakan URL file statis atau placeholder jika belum ada upload beneran */}
                                                {img.url ? <img src={img.url} className="object-cover w-full h-full" alt="Foto Laporan" /> : <span className="text-xs text-gray-400">File Image</span>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">Tidak ada foto dilampirkan.</p>
                                    )}
                                </div>
                            </div>

                            {/* Peta Lokasi */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Lokasi Koordinat</h4>
                                <p className="text-sm text-gray-600 mb-3">{report.alamat_lengkap}</p>
                                <div className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200">
                                    <MapContainer 
                                        center={[parseFloat(report.lat), parseFloat(report.lng)]} 
                                        zoom={16} 
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <CircleMarker
                                            center={[parseFloat(report.lat), parseFloat(report.lng)]}
                                            radius={10}
                                            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.8 }}
                                        >
                                            <Popup>Lokasi Dilaporkan</Popup>
                                        </CircleMarker>
                                    </MapContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Action & Timeline */}
                    <div className="space-y-6">
                        
                        {/* Panel Action (Hanya muncul berdasarkan status) */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Tindakan</h3>
                            
                            {report.status === 'pending' && (
                                <div className="space-y-3">
                                    {!showRejectForm ? (
                                        <>
                                            <button 
                                                onClick={handleVerify}
                                                disabled={processing}
                                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md font-medium text-sm transition-colors"
                                            >
                                                Verifikasi Laporan
                                            </button>
                                            <button 
                                                onClick={() => setShowRejectForm(true)}
                                                className="w-full bg-white border border-red-500 text-red-600 hover:bg-red-50 py-2 px-4 rounded-md font-medium text-sm transition-colors"
                                            >
                                                Tolak Laporan
                                            </button>
                                        </>
                                    ) : (
                                        <form onSubmit={handleReject} className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Alasan Penolakan</label>
                                                <textarea 
                                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                    rows={3}
                                                    required
                                                    value={data.notes}
                                                    onChange={e => setData('notes', e.target.value)}
                                                ></textarea>
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="submit" disabled={processing} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium">Kirim Penolakan</button>
                                                <button type="button" onClick={() => setShowRejectForm(false)} className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm">Batal</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}

                            {report.status === 'verified' && (
                                <form onSubmit={handleAssign} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tugaskan ke Petugas:</label>
                                        <select 
                                            required
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            value={data.petugas_id}
                                            onChange={e => setData('petugas_id', e.target.value)}
                                        >
                                            <option value="">-- Pilih Petugas --</option>
                                            {petugas.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
                                    >
                                        Tugaskan Sekarang
                                    </button>
                                </form>
                            )}

                            {['in_progress', 'completed', 'rejected'].includes(report.status) && (
                                <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-100">
                                    <p className="text-sm text-gray-600">
                                        Laporan ini sudah <span className="font-semibold uppercase">{report.status}</span>.
                                    </p>
                                    {report.assignment && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Petugas: {report.assignment.petugas?.name}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Panel Timeline Riwayat */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Riwayat Laporan</h3>
                            <div className="space-y-4">
                                {report.histories && report.histories.map((history: any, index: number) => (
                                    <div key={history.id} className="relative pl-4 border-l-2 border-gray-200">
                                        <div className="absolute w-2.5 h-2.5 bg-gray-400 rounded-full -left-[5.5px] top-1"></div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            {new Date(history.created_at).toLocaleString('id-ID')}
                                        </div>
                                        <div className="text-sm font-medium text-gray-800 uppercase">
                                            {history.to_status.replace('_', ' ')}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {history.notes}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Oleh: {history.changed_by?.name || 'Sistem'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}