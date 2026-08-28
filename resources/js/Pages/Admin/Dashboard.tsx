import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface ReportData {
    id: number;
    damage_category: string;
    status: string;
    lat: string;
    lng: string;
    alamat_lengkap: string;
}

interface DashboardProps {
    auth: {
        user: { name: string; email: string };
    };
    stats: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
    };
    mapReports: ReportData[];
}

export default function Dashboard({ auth, stats, mapReports }: DashboardProps) {
    // Fungsi untuk menentukan warna marker berdasarkan status
    const getMarkerColor = (status: string) => {
        switch (status) {
            case 'pending': return '#ef4444'; // Merah
            case 'verified':
            case 'in_progress': return '#eab308'; // Kuning
            case 'completed': return '#22c55e'; // Hijau
            default: return '#6b7280'; // Abu-abu (rejected)
        }
    };

    // Format teks kategori
    const formatCategory = (text: string) => {
        return text.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // Koordinat tengah default (Bisa disesuaikan ke Batulicin)
    const defaultCenter: [number, number] = [-3.447515, 116.002235];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard Pemantauan
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Kartu Statistik */}
                    <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-4">
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <div className="text-sm font-medium text-gray-500">Total Laporan</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-sm border-b-4 border-red-500">
                            <div className="text-sm font-medium text-gray-500">Menunggu (Pending)</div>
                            <div className="text-3xl font-bold text-red-600">{stats.pending}</div>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-sm border-b-4 border-yellow-500">
                            <div className="text-sm font-medium text-gray-500">Sedang Dikerjakan</div>
                            <div className="text-3xl font-bold text-yellow-600">{stats.in_progress}</div>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-sm border-b-4 border-green-500">
                            <div className="text-sm font-medium text-gray-500">Selesai</div>
                            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                        </div>
                    </div>

                    {/* Peta Sebaran Leaflet */}
                    <div className="p-6 bg-white rounded-lg shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Peta Sebaran Kerusakan</h3>
                        
                        <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-200">
                            <MapContainer 
                                center={defaultCenter} 
                                zoom={14} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {mapReports.map((report) => (
                                    <CircleMarker
                                        key={report.id}
                                        center={[parseFloat(report.lat), parseFloat(report.lng)]}
                                        radius={8}
                                        pathOptions={{
                                            color: getMarkerColor(report.status),
                                            fillColor: getMarkerColor(report.status),
                                            fillOpacity: 0.8,
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-1">
                                                <div className="font-bold mb-1">
                                                    {formatCategory(report.damage_category)}
                                                </div>
                                                <div className="text-sm mb-2">
                                                    Status: <span className="font-semibold uppercase">{report.status}</span>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {report.alamat_lengkap}
                                                </div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}