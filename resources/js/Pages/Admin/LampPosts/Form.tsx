import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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

/**
 * Memindahkan posisi center map ketika position berubah
 */
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

    /**
     * Drag marker
     */
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;

                if (marker != null) {
                    const pos = marker.getLatLng();

                    const lat = Number(pos.lat.toFixed(7));
                    const lng = Number(pos.lng.toFixed(7));

                    setPosition({
                        lat,
                        lng,
                    });

                    setManualLat(String(lat));
                    setManualLng(String(lng));

                    setData((d) => ({
                        ...d,
                        lat,
                        lng,
                    }));
                }
            },
        }),
        [setData]
    );

    /**
     * Search lokasi menggunakan Nominatim
     */
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
                    {
                        signal: controller.signal,
                        headers: {
                            Accept: 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Gagal mencari lokasi.');
                }

                const results = await response.json();

                setSearchResults(results);
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    setSearchError(
                        'Gagal mencari lokasi. Silakan coba lagi.'
                    );
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

    /**
     * Pilih hasil pencarian
     */
    const selectLocation = (result: LocationResult) => {
        const lat = Number(result.lat);
        const lng = Number(result.lon);

        setPosition({
            lat,
            lng,
        });

        setManualLat(String(lat));
        setManualLng(String(lng));

        setData((d) => ({
            ...d,
            lat,
            lng,
        }));

        setSearch(result.display_name);
        setSearchResults([]);
    };

    /**
     * Terapkan koordinat manual
     */
    const applyCoordinates = () => {
        const lat = Number(manualLat);
        const lng = Number(manualLng);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
        ) {
            alert(
                'Koordinat tidak valid.\nLatitude harus antara -90 sampai 90.\nLongitude harus antara -180 sampai 180.'
            );

            return;
        }

        setPosition({
            lat,
            lng,
        });

        setData((d) => ({
            ...d,
            lat,
            lng,
        }));
    };

    /**
     * Submit
     */
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
                <h2 className="text-xl font-semibold text-gray-800">
                    {isEdit ? 'Edit Data Tiang' : 'Tambah Data Tiang'}
                </h2>
            }
        >
            <Head title={isEdit ? 'Edit Tiang' : 'Tambah Tiang'} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white p-6 shadow-sm">

                        <form
                            onSubmit={submit}
                            className="grid grid-cols-1 gap-6 md:grid-cols-2"
                        >

                            {/* ========================= */}
                            {/* KIRI - FORM INPUT */}
                            {/* ========================= */}

                            <div className="space-y-4">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Kode Tiang (Misal: PJU-BTC-001)
                                    </label>

                                    <input
                                        type="text"
                                        value={data.code_tiang}
                                        onChange={(e) =>
                                            setData(
                                                'code_tiang',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                        required
                                    />

                                    {errors.code_tiang && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.code_tiang}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Jenis
                                        </label>

                                        <select
                                            value={data.type}
                                            onChange={(e) =>
                                                setData(
                                                    'type',
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                        >
                                            <option value="pju">
                                                PJU (Lampu Jalan)
                                            </option>

                                            <option value="traffic_light">
                                                Traffic Light
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>

                                        <select
                                            value={data.status_lampu}
                                            onChange={(e) =>
                                                setData(
                                                    'status_lampu',
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                        >
                                            <option value="active">
                                                Aktif (Menyala)
                                            </option>

                                            <option value="broken">
                                                Rusak / Mati
                                            </option>

                                            <option value="maintenance">
                                                Pemeliharaan
                                            </option>
                                        </select>
                                    </div>

                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Kecamatan
                                    </label>

                                    <input
                                        type="text"
                                        value={data.kecamatan}
                                        onChange={(e) =>
                                            setData(
                                                'kecamatan',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Kelurahan
                                    </label>

                                    <input
                                        type="text"
                                        value={data.kelurahan}
                                        onChange={(e) =>
                                            setData(
                                                'kelurahan',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Alamat Lengkap
                                    </label>

                                    <textarea
                                        value={data.alamat}
                                        onChange={(e) =>
                                            setData(
                                                'alamat',
                                                e.target.value
                                            )
                                        }
                                        rows={2}
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                    />
                                </div>

                            </div>

                            {/* ========================= */}
                            {/* KANAN - PETA */}
                            {/* ========================= */}

                            <div className="space-y-4">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Cari Lokasi
                                    </label>

                                    <div className="relative mt-1">

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            placeholder="Contoh: Kantor Bupati Tanah Bumbu"
                                            className="block w-full rounded-md border-gray-300 pr-10 text-sm shadow-sm"
                                        />

                                        {searching && (
                                            <div className="absolute right-3 top-2.5">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                                            </div>
                                        )}

                                        {/* Search results */}
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-[1000] mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">

                                                {searchResults.map(
                                                    (result, index) => (
                                                        <button
                                                            type="button"
                                                            key={`${result.lat}-${result.lon}-${index}`}
                                                            onClick={() =>
                                                                selectLocation(
                                                                    result
                                                                )
                                                            }
                                                            className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-50"
                                                        >
                                                            {result.display_name}
                                                        </button>
                                                    )
                                                )}

                                            </div>
                                        )}

                                    </div>

                                    {searchError && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {searchError}
                                        </p>
                                    )}

                                    <p className="mt-1 text-xs text-gray-500">
                                        Ketik nama jalan, kantor, desa,
                                        kecamatan, atau lokasi lainnya.
                                    </p>
                                </div>

                                {/* ========================= */}
                                {/* INPUT KOORDINAT */}
                                {/* ========================= */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Koordinat
                                    </label>

                                    <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">

                                        <input
                                            type="number"
                                            step="any"
                                            value={manualLat}
                                            onChange={(e) =>
                                                setManualLat(e.target.value)
                                            }
                                            placeholder="Latitude"
                                            className="block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                        />

                                        <input
                                            type="number"
                                            step="any"
                                            value={manualLng}
                                            onChange={(e) =>
                                                setManualLng(e.target.value)
                                            }
                                            placeholder="Longitude"
                                            className="block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                        />

                                        <button
                                            type="button"
                                            onClick={applyCoordinates}
                                            className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                                        >
                                            Terapkan
                                        </button>

                                    </div>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Contoh: -3.447515, 116.002235
                                    </p>
                                </div>

                                {/* ========================= */}
                                {/* MAP */}
                                {/* ========================= */}

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Titik Lokasi
                                    </label>

                                    <div className="h-[350px] w-full overflow-hidden rounded-lg border border-gray-300">

                                        <MapContainer
                                            center={[
                                                position.lat,
                                                position.lng,
                                            ]}
                                            zoom={15}
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                            }}
                                        >

                                            <MapController
                                                position={position}
                                            />

                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; OpenStreetMap contributors'
                                            />

                                            <Marker
                                                draggable={true}
                                                eventHandlers={eventHandlers}
                                                position={position}
                                                ref={markerRef}
                                            >
                                                <Popup>
                                                    Geser marker untuk
                                                    menyesuaikan lokasi.
                                                </Popup>
                                            </Marker>

                                        </MapContainer>

                                    </div>
                                </div>

                                {/* Koordinat aktif */}

                                <div className="rounded-md bg-gray-50 p-3 text-xs">

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <span className="text-gray-500">
                                                Latitude
                                            </span>

                                            <div className="font-mono font-medium text-gray-800">
                                                {position.lat}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-gray-500">
                                                Longitude
                                            </span>

                                            <div className="font-mono font-medium text-gray-800">
                                                {position.lng}
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* ========================= */}
                            {/* BUTTON */}
                            {/* ========================= */}

                            <div className="mt-2 flex justify-end space-x-3 border-t pt-4 md:col-span-2">

                                <Link
                                    href={route(
                                        'admin.lamp-posts.index'
                                    )}
                                    className="rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    Batal
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isEdit
                                        ? 'Simpan Perubahan'
                                        : 'Tambah Tiang'}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}