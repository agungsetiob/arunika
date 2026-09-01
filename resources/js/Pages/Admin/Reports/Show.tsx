import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { 
    ArrowLeft, MapPin, Camera, User, 
    CheckCircle2, XCircle, Wrench, Clock, 
    FileText, Zap, ShieldAlert, AlertTriangle
} from 'lucide-react';

import ConfirmModal from '@/Components/ConfirmModal'; 

export default function Show({ report, petugas }: any) {
    // 1. Tambahkan state priority di useForm
    const { data, setData, post, processing } = useForm({
        notes: '',
        petugas_id: '',
        priority: 'medium' // Default prioritas
    });

    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

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

    // Helper warna prioritas
    const getPriorityBadge = (priority: string) => {
        if (!priority) return '';
        const styles: Record<string, string> = {
            low: 'bg-slate-100 text-slate-600 border border-slate-200',
            medium: 'bg-blue-50 text-blue-600 border border-blue-200',
            high: 'bg-orange-50 text-orange-600 border border-orange-200',
            emergency: 'bg-red-50 text-red-600 border border-red-200 shadow-sm',
        };
        return styles[priority] || 'bg-slate-100 text-slate-600 border border-slate-200';
    };

    const executeVerify = () => {
        post(route('admin.reports.verify', report.id), {
            onSuccess: () => setIsVerifyModalOpen(false)
        });
    };

    const executeReject = () => {
        post(route('admin.reports.reject', report.id), {
            onSuccess: () => setIsRejectModalOpen(false)
        });
    };

    const executeAssign = () => {
        post(route('admin.reports.assign', report.id), {
            onSuccess: () => setIsAssignModalOpen(false)
        });
    };

    const handleRejectClick = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!data.notes.trim()) {
            alert('Silakan isi alasan penolakan terlebih dahulu.');
            return;
        }
        setIsRejectModalOpen(true);
    };

    const handleAssignClick = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!data.petugas_id) {
            alert('Silakan pilih petugas terlebih dahulu.');
            return;
        }
        setIsAssignModalOpen(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link 
                        href={route('admin.reports.index')} 
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                        title="Kembali"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="text-xl font-extrabold text-slate-800">
                        Detail Tiket #{report.id}
                    </h2>
                </div>
            }
        >
            <Head title={`Detail Laporan #${report.id}`} />

            <div className="py-2">
                <div className="mx-auto max-w-8xl sm:px-4 lg:px-2 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* KOLOM KIRI: Informasi Utama & Peta */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className={`w-5 h-5 ${report.type === 'pju' ? 'text-amber-500' : 'text-red-500'}`} />
                                        <h3 className="text-xl font-extrabold text-slate-800">
                                            {report.type === 'pju' ? 'Lampu Jalan' : 'Lampu Merah'} - {report.damage_category.replace('_', ' ').toUpperCase()}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                                        <User className="w-4 h-4" />
                                        <span>Dilaporkan oleh <span className="font-bold text-slate-700">{report.user.name}</span> ({report.user.phone})</span>
                                    </div>
                                </div>
                                
                                {/* Tampilan Status & Prioritas di Kanan Atas */}
                                <div className="flex flex-col items-start sm:items-end gap-2">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${getStatusBadge(report.status)}`}>
                                        {report.status.replace('_', ' ')}
                                    </span>
                                    {report.priority && (
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getPriorityBadge(report.priority)}`}>
                                            <AlertTriangle size={12} /> Prioritas: {report.priority}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-orange-500" /> Deskripsi Laporan
                                </h4>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 text-sm leading-relaxed">
                                    {report.description || <span className="italic text-slate-400">Tidak ada deskripsi tambahan dari pelapor.</span>}
                                </div>
                            </div>

                            {/* Foto Laporan */}
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-orange-500" /> Bukti Foto (Kondisi Awal)
                                </h4>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {report.media && report.media.length > 0 ? (
                                        report.media.map((img: any) => (
                                            <div key={img.id} className="min-w-[160px] h-36 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                                {img.url ? (
                                                    <img src={img.url} className="object-cover w-full h-full hover:scale-105 transition-transform cursor-pointer" alt="Bukti Laporan" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                        <Camera className="w-6 h-6 mb-1 opacity-50" />
                                                        <span className="text-[10px] font-medium uppercase">No Image</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100 w-full text-center">
                                            Tidak ada foto yang dilampirkan oleh pelapor.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Peta Lokasi */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-orange-500" /> Titik Koordinat Lokasi
                                </h4>
                                <p className="text-sm text-slate-500 mb-4">{report.alamat_lengkap}</p>
                                <div className="w-full h-[350px] rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0 relative">
                                    <MapContainer 
                                        center={[parseFloat(report.lat), parseFloat(report.lng)]} 
                                        zoom={16} 
                                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <CircleMarker
                                            center={[parseFloat(report.lat), parseFloat(report.lng)]}
                                            radius={12}
                                            pathOptions={{ color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.3, weight: 2 }}
                                        >
                                            <Popup className="font-sans">
                                                <strong>Lokasi Dilaporkan</strong><br/>
                                                <span className="text-xs text-gray-500">{report.alamat_lengkap}</span>
                                            </Popup>
                                        </CircleMarker>
                                    </MapContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN: Action & Timeline */}
                    <div className="space-y-6">
                        
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                            
                            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-slate-400" /> Pusat Kendali
                            </h3>
                            
                            {/* JIKA STATUS PENDING -> Verifikasi / Tolak */}
                            {report.status === 'pending' && (
                                <div className="space-y-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsVerifyModalOpen(true)}
                                        disabled={processing}
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-5 h-5" /> Verifikasi Laporan
                                    </button>

                                    <form onSubmit={handleRejectClick} className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                                        <div>
                                            <label className="text-sm font-bold text-red-700 mb-1 block">Tolak Laporan (Alasan)</label>
                                            <textarea 
                                                className="w-full rounded-lg border-red-200 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm bg-white"
                                                rows={2} required placeholder="Sebutkan alasannya..."
                                                value={data.notes} onChange={e => setData('notes', e.target.value)}
                                            ></textarea>
                                        </div>
                                        <button 
                                            type="submit" disabled={processing} 
                                            className="w-full mt-3 flex items-center justify-center gap-2 bg-white border border-red-500 text-red-600 hover:bg-red-600 hover:text-white py-2 px-4 rounded-lg text-sm font-bold transition-all"
                                        >
                                            <XCircle className="w-4 h-4" /> Tolak Tiket Ini
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* JIKA STATUS VERIFIED -> Tugaskan Petugas */}
                            {report.status === 'verified' && (
                                <form onSubmit={handleAssignClick} className="space-y-4">
                                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 mb-4 space-y-4">
                                        <p className="text-xs text-sky-700 font-medium leading-relaxed">Laporan valid. Silakan tentukan prioritas dan pilih petugas lapangan.</p>
                                        
                                        {/* Dropdown Prioritas */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Tingkat Prioritas:</label>
                                            <select 
                                                required
                                                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm bg-white font-medium"
                                                value={data.priority} onChange={e => setData('priority', e.target.value)}
                                            >
                                                <option value="low">Rendah (Low)</option>
                                                <option value="medium">Menengah (Medium)</option>
                                                <option value="high">Tinggi (High)</option>
                                                <option value="emergency">Darurat (Emergency)</option>
                                            </select>
                                        </div>

                                        {/* Dropdown Petugas */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Pilih Petugas:</label>
                                            <select 
                                                required
                                                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm bg-white"
                                                value={data.petugas_id} onChange={e => setData('petugas_id', e.target.value)}
                                            >
                                                <option value="">-- Pilih Tim Lapangan --</option>
                                                {petugas.map((p: any) => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button 
                                        type="submit" disabled={processing || !data.petugas_id}
                                        className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 disabled:bg-slate-300"
                                    >
                                        <Wrench className="w-5 h-5" /> Tugaskan Sekarang
                                    </button>
                                </form>
                            )}

                            {/* JIKA STATUS IN_PROGRESS / COMPLETED / REJECTED -> Info Saja */}
                            {['assigned', 'in_progress', 'completed', 'rejected'].includes(report.status) && (
                                <div className="text-center p-5 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 mb-3">
                                        {report.status === 'completed' ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : 
                                         report.status === 'rejected' ? <XCircle className="w-6 h-6 text-red-600" /> : 
                                         <Wrench className="w-6 h-6 text-sky-600" />}
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">Status tiket ini:</p>
                                    <p className="text-lg font-black text-slate-800 uppercase tracking-widest">{report.status.replace('_', ' ')}</p>
                                    
                                    {report.assignment && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2 text-left">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Ditugaskan Kepada</p>
                                                <p className="text-sm font-bold text-slate-800">{report.assignment.petugas?.name || 'Tidak diketahui'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Panel Timeline Riwayat (Log) */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-slate-400" /> Riwayat Aktivitas
                            </h3>
                            
                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                                {report.histories && report.histories.length > 0 ? (
                                    report.histories.map((history: any, index: number) => (
                                        <div key={history.id} className="relative pl-6">
                                            {/* Dot Timeline */}
                                            <div className="absolute w-3.5 h-3.5 bg-orange-500 rounded-full -left-[9px] top-1 border-2 border-white shadow-sm"></div>
                                            
                                            <div className="text-xs font-bold text-slate-400 mb-1">
                                                {new Date(history.created_at).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
                                                })}
                                            </div>
                                            <div className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                                                &rarr; {history.to_status.replace('_', ' ')}
                                            </div>
                                            <div className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                {history.notes}
                                            </div>
                                            <div className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" /> Oleh: {history.changed_by?.name || 'Sistem'}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="pl-6 text-sm text-slate-500 italic">
                                        Belum ada riwayat aktivitas tercatat.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* KUMPULAN MODAL KONFIRMASI */}
            <ConfirmModal 
                isOpen={isVerifyModalOpen}
                title="Verifikasi Laporan Masuk"
                message="Apakah Anda yakin laporan ini valid dan siap diproses? Tiket ini akan masuk ke antrean tugas (Verified)."
                confirmText="Ya, Verifikasi"
                confirmColor="emerald"
                onCancel={() => setIsVerifyModalOpen(false)}
                onConfirm={executeVerify}
            />

            <ConfirmModal 
                isOpen={isRejectModalOpen}
                title="Konfirmasi Penolakan"
                message={`Anda akan menolak tiket ini dengan alasan: "${data.notes}". Tiket akan ditutup secara permanen. Lanjutkan?`}
                confirmText="Ya, Tolak Tiket"
                confirmColor="red"
                onCancel={() => setIsRejectModalOpen(false)}
                onConfirm={executeReject}
            />

            <ConfirmModal 
                isOpen={isAssignModalOpen}
                title="Tugaskan Petugas"
                message={`Kirim notifikasi tugas perbaikan ini ke aplikasi mobile Petugas dengan prioritas ${data.priority}?`}
                confirmText="Kirim Tugas"
                confirmColor="blue"
                onCancel={() => setIsAssignModalOpen(false)}
                onConfirm={executeAssign}
            />

        </AuthenticatedLayout>
    );
}