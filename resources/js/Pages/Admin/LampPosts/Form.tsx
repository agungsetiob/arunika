import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    ArrowLeft, Save, MapPin, Search, 
    Target, Hash, Zap, Activity, Navigation 
} from 'lucide-react';

import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationResult {
    lat: string;
    lon: string;
    display_name: string;
}

interface MapControllerProps {
    position: {
        lat: number;
        lng: number;
    };
}

function MapController({ position }: MapControllerProps) {
    const map = useMap();
    useEffect(() => {
        map.setView([position.lat, position.lng], map.getZoom(), {
            animate: true,
        });
    }, [position, map]);
    return null;
}

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

    const [position, setPosition] = useState({
        lat: Number(data.lat),
        lng: Number(data.lng),
    });

    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    const [manualLat, setManualLat] = useState(String(data.lat));
    const [manualLng, setManualLng] = useState(String(data.lng));

    const markerRef = useRef<any>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const pos = marker.getLatLng();
                    const lat = Number(pos.lat.toFixed(7));
                    const lng = Number(pos.lng.toFixed(7));

                    setPosition({ lat, lng });
                    setManualLat(String(lat));
                    setManualLng(String(lng));

                    setData((d) => ({ ...d, lat, lng }));
                }
            },
        }),
        [setData]
    );

    useEffect(() => {
        if (!search.trim()) {
            setSearchResults([]);
            setSearchError('');
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(async () => {
            try {
                setSearching(true);
                setSearchError('');

                const params = new URLSearchParams({
                    q: search,
                    format: 'json',
                    limit: '5',
                    countrycodes: 'id',
                    addressdetails: '1',
                });

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
                    { signal: controller.signal, headers: { Accept: 'application/json' } }
                );

                if (!response.ok) throw new Error('Gagal mencari lokasi.');

                const results = await response.json();
                setSearchResults(results);
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    setSearchError('Gagal mencari lokasi. Silakan coba lagi.');
                }
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [search]);

    const selectLocation = (result: LocationResult) => {
        const lat = Number(result.lat);
        const lng = Number(result.lon);

        setPosition({ lat, lng });
        setManualLat(String(lat));
        setManualLng(String(lng));
        setData((d) => ({ ...d, lat, lng }));

        setSearch(result.display_name);
        setSearchResults([]);
    };

    const applyCoordinates = () => {
        const lat = Number(manualLat);
        const lng = Number(manualLng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            alert('Koordinat tidak valid.\nLatitude harus antara -90 sampai 90.\nLongitude harus antara -180 sampai 180.');
            return;
        }

        setPosition({ lat, lng });
        setData((d) => ({ ...d, lat, lng }));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.lamp-posts.update', lampPost.id));
        } else {
            post(route('admin.lamp-posts.store'));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link 
                        href={route('admin.lamp-posts.index')} 
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                        title="Kembali"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="text-xl font-extrabold text-slate-800">
                        {isEdit ? 'Edit Master Lampu' : 'Tambah Master Lampu Baru'}
                    </h2>
                </div>
            }
        >
            <Head title={isEdit ? 'Edit Lampu' : 'Tambah Lampu'} />

            <div className="py-2">
                <div className="mx-auto max-w-8xl sm:px-6 lg:px-1">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">

                        <form onSubmit={submit} className="grid grid-cols-1 gap-10 lg:grid-cols-2">

                            {/* ========================= */}
                            {/* KIRI - FORM INPUT */}
                            {/* ========================= */}
                            <div className="space-y-6">
                                
                                <div className="border-b border-slate-100 pb-4 mb-2">
                                    <h3 className="text-lg font-bold text-slate-800">Detail Spesifikasi</h3>
                                    <p className="text-sm text-slate-500">Masukkan kode dan jenis infrastruktur.</p>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                        <Hash className="w-4 h-4 text-orange-500" /> Kode Lampu (ID Unik)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code_tiang}
                                        onChange={(e) => setData('code_tiang', e.target.value)}
                                        placeholder="Misal: PJU-BTC-001"
                                        className="block w-full rounded-xl border-slate-200 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-shadow bg-slate-50 focus:bg-white"
                                        required
                                    />
                                    {errors.code_tiang && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.code_tiang}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                            <Zap className="w-4 h-4 text-orange-500" /> Jenis
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="block w-full rounded-xl border-slate-200 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-shadow bg-slate-50 focus:bg-white"
                                        >
                                            <option value="pju">PJU (Lampu Jalan)</option>
                                            <option value="traffic_light">Traffic Light</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                            <Activity className="w-4 h-4 text-orange-500" /> Status
                                        </label>
                                        <select
                                            value={data.status_lampu}
                                            onChange={(e) => setData('status_lampu', e.target.value)}
                                            className="block w-full rounded-xl border-slate-200 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-shadow bg-slate-50 focus:bg-white"
                                        >
                                            <option value="active">Aktif (Menyala)</option>
                                            <option value="broken">Rusak / Mati</option>
                                            <option value="maintenance">Pemeliharaan</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-b border-slate-100 pb-4 pt-4 mb-2 mt-4">
                                    <h3 className="text-lg font-bold text-slate-800">Area Wilayah</h3>
                                    <p className="text-sm text-slate-500">Administrasi letak lampu.</p>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                        <Navigation className="w-4 h-4 text-orange-500" /> Kecamatan
                                    </label>
                                    <input
                                        type="text" value={data.kecamatan}
                                        onChange={(e) => setData('kecamatan', e.target.value)}
                                        className="block w-full rounded-xl border-slate-200 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-shadow bg-slate-50 focus:bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                        <Navigation className="w-4 h-4 text-orange-500" /> Kelurahan / Desa
                                    </label>
                                    <input
                                        type="text" value={data.kelurahan}
                                        onChange={(e) => setData('kelurahan', e.target.value)}
                                        className="block w-full rounded-xl border-slate-200 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-shadow bg-slate-50 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                        <MapPin className="w-4 h-4 text-orange-500" /> Alamat Lengkap
                                    </label>
                                    <textarea
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        rows={3}
                                        placeholder="Nama jalan, patokan terdekat..."
                                        className="block w-full rounded-xl border-slate-200 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-shadow bg-slate-50 focus:bg-white resize-none"
                                    />
                                </div>
                            </div>

                            {/* ========================= */}
                            {/* KANAN - PETA & KOORDINAT */}
                            {/* ========================= */}
                            <div className="space-y-6 bg-slate-100 p-6 rounded-2xl border border-slate-100">
                                
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                        <Search className="w-4 h-4 text-orange-500" /> Cari Lokasi Peta
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text" value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Ketik area, gedung, atau jalan..."
                                            className="block w-full rounded-xl border-slate-200 pr-10 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-shadow bg-white"
                                        />
                                        {searching && (
                                            <div className="absolute right-3 top-2.5">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" />
                                            </div>
                                        )}

                                        {searchResults.length > 0 && (
                                            <div className="absolute z-[1000] mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                                                {searchResults.map((result, index) => (
                                                    <button
                                                        type="button" key={`${result.lat}-${result.lon}-${index}`}
                                                        onClick={() => selectLocation(result)}
                                                        className="block w-full border-b border-slate-50 px-4 py-3 text-left text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors"
                                                    >
                                                        {result.display_name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {searchError && <p className="mt-1.5 text-xs text-red-500 font-medium">{searchError}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                        <Target className="w-4 h-4 text-orange-500" /> Input Koordinat GPS Manual
                                    </label>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                                        <input
                                            type="number" step="any" value={manualLat}
                                            onChange={(e) => setManualLat(e.target.value)}
                                            placeholder="Latitude (-3.123)"
                                            className="block w-full rounded-xl border-slate-200 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-white"
                                        />
                                        <input
                                            type="number" step="any" value={manualLng}
                                            onChange={(e) => setManualLng(e.target.value)}
                                            placeholder="Longitude (116.123)"
                                            className="block w-full rounded-xl border-slate-200 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-white"
                                        />
                                        <button
                                            type="button" onClick={applyCoordinates}
                                            className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-900 shadow-sm transition-colors"
                                        >
                                            Terapkan
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="text-sm font-bold text-slate-700">Preview Peta (Bisa digeser)</label>
                                    </div>
                                    <div className="h-[320px] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm z-0 relative">
                                        <MapContainer center={[position.lat, position.lng]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                                            <MapController position={position} />
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef}>
                                                <Popup className="font-sans text-sm">Geser pin untuk penyesuaian akhir.</Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                </div>

                                {/* Koordinat Aktif Indicator */}
                                <div className="rounded-xl bg-white p-4 text-sm border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-0.5">Latitude</span>
                                        <span className="font-mono font-bold text-slate-700">{position.lat}</span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200"></div>
                                    <div>
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-0.5">Longitude</span>
                                        <span className="font-mono font-bold text-slate-700">{position.lng}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ========================= */}
                            {/* ACTION BUTTONS */}
                            {/* ========================= */}
                            <div className="lg:col-span-2 flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
                                <Link
                                    href={route('admin.lamp-posts.index')}
                                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 bg-orange-600 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-orange-700 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {isEdit ? 'Simpan Perubahan' : 'Simpan Lampu Baru'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}