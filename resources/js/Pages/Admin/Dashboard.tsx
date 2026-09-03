import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    ActivitySquare, AlertTriangle, CheckCircle, Clock, 
    Lightbulb, LightbulbOff, Zap, RefreshCw, MapPin
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function FitBounds({ reports }: { reports: any[] }) {
    const map = useMap();
    
    useEffect(() => {
        if (reports && reports.length > 0) {
            const markers = reports.map(r => [parseFloat(r.lat), parseFloat(r.lng)] as [number, number]);
            const bounds = L.latLngBounds(markers);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [reports, map]);

    return null;
}

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/v1/admin/dashboard-stats');
            setStats(response.data.data);
        } catch (error) {
            console.error("Gagal memuat statistik", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, bgClass }: any) => (
        // ... (Fungsi StatCard sama persis seperti sebelumnya)
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${bgClass}`}>
                <Icon className={`w-8 h-8 ${colorClass}`} />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
                    {subtitle && <span className="text-xs font-medium text-slate-400">{subtitle}</span>}
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout header="Dashboard Utama">
            <Head title="Dashboard" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Ringkasan Sistem</h2>
                        <p className="text-slate-500 mt-1 text-sm">Pantau kondisi infrastruktur dan laporan warga terkini.</p>
                    </div>
                    <button 
                        onClick={fetchStats} disabled={loading}
                        className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ea580c]' : ''}`} />
                        Segarkan Data
                    </button>
                </div>

                {loading && !stats ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <RefreshCw className="w-10 h-10 animate-spin text-[#ea580c] mb-4" />
                        <p className="text-slate-500 font-medium">Menghimpun data analitik...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* 1. Baris Status Laporan (Sama seperti sebelumnya) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Menunggu Validasi" value={stats?.reports.pending} subtitle="laporan masuk" icon={Clock} bgClass="bg-yellow-50" colorClass="text-yellow-600" />
                            <StatCard title="Sedang Diperbaiki" value={stats?.reports.in_progress} subtitle="di lapangan" icon={Zap} bgClass="bg-sky-50" colorClass="text-sky-600" />
                            <StatCard title="Selesai Ditangani" value={stats?.reports.completed} subtitle="laporan tuntas" icon={CheckCircle} bgClass="bg-emerald-50" colorClass="text-emerald-600" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* 2. Kesehatan Infrastruktur (Kiri) */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <StatCard title="Lampu Menyala/Normal" value={stats?.assets.active} subtitle={`dari ${stats?.assets.total} total tiang`} icon={Lightbulb} bgClass="bg-emerald-50" colorClass="text-emerald-500" />
                                    <StatCard title="Lampu Padam/Rusak" value={stats?.assets.broken} subtitle="perlu perbaikan" icon={LightbulbOff} bgClass="bg-red-50" colorClass="text-red-500" />
                                </div>

                                {/* PETA SEBARAN (Kembali dimunculkan) */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-orange-500" /> Peta Sebaran Laporan
                                    </h3>
                                    <div className="h-[400px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden z-0 relative">
                                        {/* PETA SEBARAN (Auto-Center ke Daerahmu) */}
                                        <div>
                                            <div className="h-[400px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden z-0 relative">
                                                <MapContainer 
                                                    // Center ini hanya dipakai sebentar saat peta pertama kali loading
                                                    center={[-6.200000, 106.816666]} 
                                                    zoom={12} 
                                                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                                                >
                                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                    
                                                    {/* Panggil komponen auto-center di sini */}
                                                    <FitBounds reports={stats?.mapReports || []} />

                                                    {stats?.mapReports?.map((report: any) => (
                                                        <Marker key={report.id} position={[parseFloat(report.lat), parseFloat(report.lng)]}>
                                                            <Popup>
                                                                <div className="text-sm">
                                                                    <strong>{report.damage_category.replace(/_/g, ' ').toUpperCase()}</strong><br/>
                                                                    <span className="text-slate-500 text-xs">{report.alamat_lengkap}</span><br/>
                                                                    <span className="mt-1 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold uppercase">
                                                                        {report.status.replace('_', ' ')}
                                                                    </span>
                                                                </div>
                                                            </Popup>
                                                        </Marker>
                                                    ))}
                                                </MapContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Laporan Terbaru */}
                            <div className="lg:col-span-1">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" /> 5 Laporan Terakhir
                                </h3>
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    {stats?.recent_reports.length > 0 ? (
                                        <ul className="divide-y divide-slate-50">
                                            {stats.recent_reports.map((report: any) => (
                                                <li key={report.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">{report.status.replace('_', ' ')}</span>
                                                        <span className="text-xs text-slate-400">{new Date(report.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 mt-2 truncate">{report.damage_category.replace(/_/g, ' ').toUpperCase()}</p>
                                                    <p className="text-xs text-slate-500 mt-1 truncate">Oleh: {report.user?.name} • Tiang: {report.lamp_post?.code_tiang || 'N/A'}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 text-sm">Belum ada laporan masuk.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </AuthenticatedLayout>
    );
}