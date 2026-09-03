import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { Loader } from 'lucide-react';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  phone?: string;
  nik?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'add' | 'edit';
  user: User | null;
}

export default function UserFormModal({ isOpen, onClose, type, user }: Props) {
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    email: '',
    password: '',
    role: 'petugas',
    phone: '',
    nik: '',
  });

  useEffect(() => {
    if (isOpen) {
      clearErrors();
      if (type === 'edit' && user) {
        setData({
          name: user.name,
          email: user.email,
          password: '',
          role: user.roles[0]?.name || 'petugas',
          phone: user.phone || '',
          nik: user.nik || '',
        });
      } else {
        reset();
      }
    }
  }, [isOpen, type, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'add') {
      post('/admin/users', { onSuccess: () => onClose() });
    } else {
      put(`/admin/users/${user?.id}`, { onSuccess: () => onClose() });
    }
  };

  const inputClass =
    'w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500';

  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="xl">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-1 text-slate-800">
          {type === 'add' ? 'Tambah Akun Baru' : 'Edit Data Akun'}
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          {type === 'add'
            ? 'Silakan isi formulir di bawah ini untuk mendaftarkan pengguna baru.'
            : 'Kosongkan kolom password jika tidak ingin mengubah password.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Lengkap</label>
            <TextInput
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className={inputClass}
              placeholder="Masukkan nama pengguna"
              isFocused={isOpen}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
            <TextInput
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className={inputClass}
              placeholder="email@arunika.go.id"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nomor HP</label>
            <TextInput
              type="text"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              className={inputClass}
              placeholder="081234567890"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">NIK</label>
            <TextInput
              type="text"
              value={data.nik}
              onChange={(e) => setData('nik', e.target.value)}
              className={inputClass}
              placeholder="Masukkan NIK"
            />
            {errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik}</p>}
          </div>

          {type === 'add' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Role Akun</label>
              <select
                value={data.role}
                onChange={(e) => setData('role', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
              >
                <option value="petugas">Petugas Lapangan</option>
                <option value="admin">Admin / Operator</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Password {type === 'edit' && '(Opsional)'}
            </label>
            <TextInput
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              className={inputClass}
              placeholder="Minimal 8 karakter"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-3 text-sm bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan Data'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
