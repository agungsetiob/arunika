import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ lampPosts }: any) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data tiang ini?')) {
            destroy(route('admin.lamp-posts.destroy', id));
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'active') return 'bg-green-100 text-green-800';
        if (status === 'broken') return 'bg-red-100 text-red-800';
        return 'bg-yellow-100 text-yellow-800';
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Master Data Tiang</h2>}>
            <Head title="Master Tiang" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex justify-end">
                        <Link href={route('admin.lamp-posts.create')} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                            + Tambah Data Tiang
                        </Link>
                    </div>
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 border-b border-gray-200 overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Kode Tiang</th>
                                        <th className="px-6 py-3">Jenis</th>
                                        <th className="px-6 py-3">Kecamatan</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lampPosts.data.map((post: any) => (
                                        <tr key={post.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-bold text-gray-900">{post.code_tiang}</td>
                                            <td className="px-6 py-4 uppercase text-xs font-semibold">{post.type.replace('_', ' ')}</td>
                                            <td className="px-6 py-4">{post.kecamatan}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getStatusBadge(post.status_lampu)}`}>
                                                    {post.status_lampu}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center space-x-2">
                                                <Link href={route('admin.lamp-posts.edit', post.id)} className="text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1.5 rounded text-xs">Edit</Link>
                                                <button onClick={() => handleDelete(post.id)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}