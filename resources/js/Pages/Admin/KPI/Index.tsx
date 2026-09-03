import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Trophy, Clock, CheckCircle2, Users, 
    Medal, Activity, User, Target, BarChart
} from 'lucide-react';

interface PetugasKPI {
    id: number;
    name: string;
    email: string;
    total_tasks: number;
    completed_tasks: number;
    avg_completion_minutes: number;
    avg_time_formatted: string;
    completion_rate: number;
}

interface Props {
    petugasData: PetugasKPI[];
    summary: {
        total_petugas: number;
        total_completed: number;
        avg_response_time: string;
    };
}

export default function Index({ petugasData, summary }: Props) {
    // Ambil Top 3 Petugas
    const topPetugas = petugasData.slice(0, 3);

    return (
        <AuthenticatedLayout header="Analitik KPI Petugas">
            <Head title="KPI Petugas" />

            <div className="flex flex-col gap-6 mt-2">
                
                {/* --- 1. SUMMARY CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-sky-50 flex items-center justify-center border border-sky-100">
                            <Users className="w-7 h-7 text-sky-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Tim Lapangan</p>
                            <h3 className="text-2xl font-black text-slate-800 leading-none">{summary.total_petugas} <span className="text-sm font-semibold text-slate-400">Personel</span></h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tugas Diselesaikan</p>
                            <h3 className="text-2xl font-black text-slate-800 leading-none">{summary.total_completed} <span className="text-sm font-semibold text-slate-400">Tiket</span></h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
                            <Clock className="w-7 h-7 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rata-rata Waktu (SLA)</p>
                            <h3 className="text-2xl font-black text-slate-800 leading-none">{summary.avg_response_time}</h3>
                        </div>
                    </div>
                </div>

                {/* --- 2. LEADERBOARD (TOP 3) --- */}
                {topPetugas.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-md text-white border border-slate-700">
                        <div className="flex items-center gap-2 mb-6">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-bold">Petugas Terbaik Bulan Ini</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {topPetugas.map((petugas, index) => {
                                const rankColors = [
                                    'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/30', // Juara 1
                                    'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 shadow-slate-400/20', // Juara 2
                                    'bg-gradient-to-br from-orange-700 to-amber-900 text-white shadow-orange-900/30' // Juara 3
                                ];
                                
                                return (
                                    <div key={petugas.id} className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-3 items-center">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black shadow-md ${rankColors[index]}`}>
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-base leading-tight truncate max-w-[120px]">{petugas.name}</h4>
                                                    <p className="text-slate-400 text-xs">{petugas.email}</p>
                                                </div>
                                            </div>
                                            {index === 0 && <Medal className="w-6 h-6 text-amber-400" />}
                                        </div>

                                        <div className="flex justify-between items-end bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Rasio Selesai</p>
                                                <div className="flex items-end gap-1">
                                                    <span className="font-black text-emerald-400 text-lg leading-none">{petugas.completion_rate}%</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Waktu</p>
                                                <p className="font-bold text-slate-300 flex items-center gap-1 text-sm leading-none"><Clock size={12} className="text-slate-400" /> {petugas.avg_time_formatted}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- 3. TABEL DETAIL RAPOR KINERJA --- */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-white flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-700">Rapor Kinerja Seluruh Petugas</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">Nama Petugas</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-center">Total Tugas</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-center">Diselesaikan</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Rasio Keberhasilan</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Rata-rata Waktu (SLA)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {petugasData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                    <Activity className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-medium">Belum ada data kinerja petugas.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    petugasData.map((petugas) => (
                                        <tr key={petugas.id} className="hover:bg-slate-50/50 transition-colors group">
                                            
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{petugas.name}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{petugas.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-md text-xs">{petugas.total_tasks}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                                    <Target size={12} /> {petugas.completed_tasks}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3 max-w-[200px]">
                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                petugas.completion_rate >= 80 ? 'bg-emerald-500' : 
                                                                petugas.completion_rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                            }`}
                                                            style={{ width: `${petugas.completion_rate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-xs font-bold w-10 text-right ${
                                                        petugas.completion_rate >= 80 ? 'text-emerald-600' : 
                                                        petugas.completion_rate >= 50 ? 'text-amber-600' : 'text-red-600'
                                                    }`}>
                                                        {petugas.completion_rate}%
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                    <Clock size={14} className="text-orange-500" />
                                                    {petugas.avg_time_formatted}
                                                </div>
                                            </td>
                                            
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}