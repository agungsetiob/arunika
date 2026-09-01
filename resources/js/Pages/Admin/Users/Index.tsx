import React, { useState, useEffect, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { UserPlus, CheckCircle, XCircle, Power, Edit, Search, Users } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UserFormModal from '@/Components/UserFormModal';
import ConfirmModal from '@/Components/ConfirmModal';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  nik: string;
  is_active: boolean;
  roles: Role[];
  accepted_reports_count?: number;
  rejected_reports_count?: number;
}

interface PaginatedData<T> {
  data: T[];
  links: { url: string | null; label: string; active: boolean }[];
  current_page: number;
  last_page: number;
  total: number;
}

interface Props {
  users: PaginatedData<User>;
  filters: {
    role?: string;
    search?: string;
  };
}

export default function Index({ users, filters }: Props) {
  const { flash } = usePage<any>().props;
  const [activeRoleFilter, setActiveRoleFilter] = useState(filters.role || '');
  const [search, setSearch] = useState(filters.search || '');
  const isFirstRender = useRef(true);
  
  // State untuk mengontrol Modal Form (Tambah/Edit)
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'add' | 'edit';
    user: User | null;
  }>({
    isOpen: false,
    type: 'add',
    user: null,
  });

  // State untuk mengontrol Modal Konfirmasi (Toggle Status)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  const handleFilterChange = (role: string) => {
    setActiveRoleFilter(role);
    router.get(route('admin.users.index'), { role: role || undefined }, { preserveState: true, replace: true });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const delay = setTimeout(() => {
      router.get(route('admin.users.index'), { 
        role: activeRoleFilter, 
        search: search 
      }, { 
        preserveState: true, 
        preserveScroll: true, 
        replace: true 
      });
    }, 500); // 500ms delay setelah berhenti mengetik

    return () => clearTimeout(delay);
  }, [search, activeRoleFilter]);

  // Fungsi untuk mengeksekusi aksi setelah Modal Konfirmasi disetujui
  const executeToggleStatus = () => {
    if (confirmModal.user) {
      router.patch(route('admin.users.toggle-status', confirmModal.user.id), {}, { 
        preserveScroll: true,
        onSuccess: () => setConfirmModal({ isOpen: false, user: null })
      });
    }
  };

  return (
    <AuthenticatedLayout header="Manajemen Pengguna">
      <Head title="Manajemen Pengguna" />

      <div className="max-w-8xl mx-auto">

        {/* Header Section (Search, Filter, Add Button) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-2">
          
          {/* Kolom Pencarian */}
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau email pengguna..."
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-shadow shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
                {   /* Filter Role - Dropdown untuk layar kecil, Buttons untuk layar besar */}
                <div className="hidden md:flex gap-1">
                {['', 'warga', 'petugas', 'admin'].map((role) => (
                    <button
                    key={role}
                    onClick={() => handleFilterChange(role)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    activeRoleFilter === role
                        ? 'bg-sky-50 text-sky-600 border-sky-200 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                    {role === '' ? 'Semua Role' : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
                ))}
                </div>

                <button
                onClick={() => setModalState({ isOpen: true, type: 'add', user: null })}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-md shadow-sky-500/20 whitespace-nowrap"
                >
                <UserPlus size={18} /> <span className="hidden sm:inline">Tambah Akun</span>
                </button>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Nama / Email</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Statistik Warga</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Users className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">Tidak ada data pengguna ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.data.map((user) => {
                    const isWarga = user.roles.some((r) => r.name === 'warga');

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-slate-800">{user.name}</p>
                          <p className="text-sm font-medium text-slate-500 mt-0.5">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles.map((role) => (
                              <span key={role.id} className="capitalize text-[10px] font-bold tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                                {role.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isWarga ? (
                            <div className="flex gap-4 text-sm font-semibold">
                              <span className="flex items-center gap-1.5 text-emerald-600">
                                <CheckCircle size={16} /> {user.accepted_reports_count ?? 0} Valid
                              </span>
                              <span className="flex items-center gap-1.5 text-red-600">
                                <XCircle size={16} /> {user.rejected_reports_count ?? 0} Ditolak
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm font-medium italic">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            user.is_active 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setModalState({ isOpen: true, type: 'edit', user: user })}
                              className="p-2 rounded-xl text-sky-600 hover:bg-sky-100 transition-colors"
                              title="Edit Akun"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => setConfirmModal({ isOpen: true, user: user })}
                              className={`p-2 rounded-xl transition-colors ${
                                user.is_active ? 'text-red-600 hover:bg-red-100' : 'text-emerald-600 hover:bg-emerald-100'
                              }`}
                              title={user.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            >
                              <Power size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination component */}
        {users?.total > 10 && (
          <div className="flex items-center justify-between px-6 py-4 mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-sm text-slate-500">
              Menampilkan <span className="font-bold text-slate-700">{users.current_page * 10 - 9}</span> - <span className="font-bold text-slate-700">{Math.min(users.current_page * 10, users.total)}</span> dari <span className="font-bold text-slate-700">{users.total}</span> pengguna
            </span>
            <div className="flex space-x-1">
              {users.links.map((link, index) => {
                let label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                return link.url ? (
                  <button
                    key={index}
                    onClick={() => router.get(link.url!, {}, { preserveScroll: true })}
                    className={`flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                      link.active 
                          ? 'bg-sky-600 text-white shadow-sm' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-sky-600'
                    }`}
                    dangerouslySetInnerHTML={{ __html: label }}
                  />
                ) : (
                  <span 
                    key={index} 
                    className="flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                    dangerouslySetInnerHTML={{ __html: label }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Form Tambah/Edit */}
        <UserFormModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          type={modalState.type}
          user={modalState.user}
        />

        {/* Modal Konfirmasi (Pengganti confirm bawaan) */}
        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          title={confirmModal.user?.is_active ? "Nonaktifkan Akun" : "Aktifkan Akun"}
          message={`Apakah Anda yakin ingin ${confirmModal.user?.is_active ? 'menonaktifkan' : 'mengaktifkan'} akun milik ${confirmModal.user?.name}? ${confirmModal.user?.is_active ? 'Pengguna ini tidak akan bisa login ke dalam aplikasi.' : ''}`}
          confirmText={confirmModal.user?.is_active ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
          confirmColor={confirmModal.user?.is_active ? "red" : "emerald"}
          onCancel={() => setConfirmModal({ isOpen: false, user: null })}
          onConfirm={executeToggleStatus}
        />

      </div>
    </AuthenticatedLayout>
  );
}