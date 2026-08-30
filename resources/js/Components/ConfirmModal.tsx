import { AlertTriangle } from 'lucide-react';
import Modal from '@/Components/Modal';

interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    confirmColor?: 'red' | 'blue' | 'emerald' | 'orange';
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Ya, Lanjutkan',
    confirmColor = 'red',
}: Props) {
    const colorClasses = {
        red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        emerald: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
        orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    };

    return (
        <Modal show={isOpen} onClose={onCancel} maxWidth="lg">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div
                        className={`p-3 rounded-full shrink-0 ${
                            confirmColor === 'red'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-orange-50 text-orange-600'
                        }`}
                    >
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    Batal
                </button>
                <button
                    onClick={onConfirm}
                    className={`px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-colors ${colorClasses[confirmColor]}`}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}
