import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix ikon marker hilang di react-leaflet
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

export default function Form({ lampPost }: any) {
    const isEdit = !!lampPost;
    
    const { data, setData, post, put, processing, errors } = useForm({
        code_tiang: lampPost?.code_tiang || '',
        type: lampPost?.type || 'pju',
        lat: lampPost?.lat || -3.447515,
        lng: lampPost?.lng || 116.002235,
        alamat: lampPost?.alamat || '',
        kecamatan: lampPost?.kecamatan || '',
        kelurahan: lampPost?.kelurahan || '',
        status_lampu: lampPost?.status_lampu || 'active',
    });

    const [position, setPosition] = useState({ lat: data.lat, lng: data.lng });
    const markerRef = useRef<any>(null);

    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const pos = marker.getLatLng();
                setPosition(pos);
                setData(d => ({ ...d, lat: pos.lat, lng: pos.lng }));
            }
        },
    }), [setData]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.lamp-posts.update', lampPost.id));
        } else {
            post(route('admin.lamp-posts.store'));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">{isEdit ? 'Edit Data Tiang' : 'Tambah Data Tiang'}</h2>}>
            <Head title={isEdit ? 'Edit Tiang' : 'Tambah Tiang'} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Kiri: Form Input */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kode Tiang (Misal: PJU-BTC-001)</label>
                                    <input type="text" value={data.code_tiang} onChange={e => setData('code_tiang', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" required />
                                    {errors.code_tiang && <p className="text-red-500 text-xs mt-1">{errors.code_tiang}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Jenis</label>
                                        <select value={data.type} onChange={e => setData('type', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm">
                                            <option value="pju">PJU (Lampu Jalan)</option>
                                            <option value="traffic_light">Traffic Light</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <select value={data.status_lampu} onChange={e => setData('status_lampu', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm">
                                            <option value="active">Aktif (Menyala)</option>
                                            <option value="broken">Rusak / Mati</option>
                                            <option value="maintenance">Pemeliharaan</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                                    <input type="text" value={data.kecamatan} onChange={e => setData('kecamatan', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kelurahan</label>
                                    <input type="text" value={data.kelurahan} onChange={e => setData('kelurahan', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                                    <textarea value={data.alamat} onChange={e => setData('alamat', e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"></textarea>
                                </div>
                            </div>

                            {/* Kanan: Peta */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Titik Koordinat (Geser Marker)</label>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <input type="text" value={data.lat} readOnly className="block w-full rounded-md border-gray-200 bg-gray-50 text-xs text-gray-500" placeholder="Latitude" />
                                    <input type="text" value={data.lng} readOnly className="block w-full rounded-md border-gray-200 bg-gray-50 text-xs text-gray-500" placeholder="Longitude" />
                                </div>
                                <div className="w-full h-[350px] rounded-lg overflow-hidden border border-gray-300">
                                    <MapContainer center={[position.lat, position.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef}>
                                            <Popup>Geser saya untuk mengubah koordinat.</Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            </div>

                            <div className="md:col-span-2 flex justify-end space-x-3 border-t pt-4 mt-2">
                                <Link href={route('admin.lamp-posts.index')} className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50">Batal</Link>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isEdit ? 'Simpan Perubahan' : 'Tambah Tiang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}