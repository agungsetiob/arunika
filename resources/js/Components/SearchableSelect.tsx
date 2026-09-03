import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
    id: string | number;
    name: string;
}

interface Props {
    options: Option[];
    value: string | number;
    onChange: (val: string | number) => void;
    onSearch: (searchTerm: string) => void;
    placeholder?: string;
}

export default function SearchableSelect({ options, value, onChange, onSearch, placeholder = 'Pilih opsi...' }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Menutup dropdown ketika klik di luar area komponen
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce search (mencegah spam request saat mengetik)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearch(searchTerm);
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const selectedOption = options.find((opt) => opt.id.toString() === value.toString());

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Tombol Select (Trigger) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:border-sky-400 focus:border-sky-500 focus:ring-sky-500 cursor-pointer transition-colors"
            >
                <span className={selectedOption ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            {/* Area Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {/* Kotak Pencarian */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                        <input
                            type="text"
                            className="w-full bg-transparent border-none text-sm focus:ring-0 p-1 text-slate-700 placeholder-slate-400"
                            placeholder="Ketik nama petugas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()} 
                            autoFocus
                        />
                        {searchTerm && (
                            <X 
                                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 mr-1 shrink-0" 
                                onClick={() => setSearchTerm('')}
                            />
                        )}
                    </div>

                    {/* Daftar Opsi */}
                    <div className="max-h-48 overflow-y-auto p-1">
                        {options.length > 0 ? (
                            options.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                                        value.toString() === option.id.toString()
                                            ? 'bg-sky-50 text-sky-700 font-bold'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {option.name}
                                    {value.toString() === option.id.toString() && (
                                        <Check className="w-4 h-4 text-sky-600" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-sm text-center text-slate-500 italic">
                                Petugas tidak ditemukan.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}