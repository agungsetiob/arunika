import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import {
    CheckCircle2,
    ClipboardList,
    FileCheck2,
    Lightbulb,
    LogIn,
    MapPin,
    Menu,
    Sparkles,
    TrafficCone,
    User,
    UserPlus,
    Wrench,
    X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface Step {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
}

const steps: Step[] = [
    {
        id: "01",
        title: "Daftar Akun",
        description:
            "Buat akun ARUNIKA dengan data yang valid agar setiap laporan dapat dipantau dengan transparan.",
        icon: UserPlus,
        color: "text-orange-600 bg-orange-50 border-orange-100",
    },
    {
        id: "02",
        title: "Buat Laporan",
        description:
            "Laporkan lampu jalan atau traffic light yang bermasalah dengan lokasi, foto, dan keterangan kejadian.",
        icon: ClipboardList,
        color: "text-orange-700 bg-orange-100 border-orange-200",
    },
    {
        id: "03",
        title: "Verifikasi",
        description:
            "Laporan Anda akan diverifikasi untuk memastikan informasi dan lokasi gangguan dapat ditindaklanjuti.",
        icon: FileCheck2,
        color: "text-orange-800 bg-orange-200 border-orange-300",
    },
    {
        id: "04",
        title: "Ditangani Tim Teknis",
        description:
            "Tim teknis melakukan pemeriksaan dan pengerjaan di lapangan sampai gangguan berhasil ditangani.",
        icon: Wrench,
        color: "text-orange-900 bg-orange-300 border-orange-400",
    },
    {
        id: "05",
        title: "Selesai",
        description:
            "Setelah pekerjaan selesai, status laporan diperbarui dan hasil penanganan dapat Anda lihat di aplikasi.",
        icon: CheckCircle2,
        color: "text-white bg-orange-500 border-orange-600",
    },
];

const downloadLinks = {
    googlePlay: "https://play.google.com/store/apps/details?id=YOUR_APP_ID",
    appStore: "https://apps.apple.com/app/YOUR_APP_ID",
};

export default function LandingPage() {
    const [mobileMenu, setMobileMenu] = useState(false);
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <Head title="Smart PJU System" />

            {/* =========================================================
                NAVBAR
            ========================================================== */}
            <header className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <nav className="flex h-20 items-center justify-between">
                        {/* Logo */}
                        <a href="/" className="flex items-center gap-3">
                            <img
                                src="/beraksi-logo.webp"
                                alt="Logo BERAKSI"
                                className="h-11 w-auto object-contain"
                            />
                            <div className="hidden border-l border-white/20 pl-3 sm:block">
                                <div className="text-sm font-bold tracking-wide text-white">
                                    ARUNIKA
                                </div>
                                <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                                    Smart PJU System
                                </div>
                            </div>
                        </a>

                        {/* Desktop Login */}
                        <div className="hidden md:block">
                            {auth.user ? (
                                <a
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-orange-500/50 hover:bg-orange-500/20"
                                >
                                    <User className="h-4 w-4" />
                                    {auth.user.name}
                                </a>
                            ) : (
                                <a
                                    href="/login"
                                    className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-orange-500/50 hover:bg-orange-500/20"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Login
                                </a>
                            )}
                        </div>

                        {/* Mobile menu */}
                        <button
                            type="button"
                            onClick={() => setMobileMenu(!mobileMenu)}
                            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white md:hidden"
                            aria-label="Toggle navigation"
                        >
                            {mobileMenu ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </nav>

                    {/* Mobile Navigation */}
                    {mobileMenu && (
                        <div className="border-t border-white/10 py-3 md:hidden">
                            {auth.user ? (
                                <a
                                    href="/dashboard"
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                    onClick={() => setMobileMenu(false)}
                                >
                                    <User className="h-4 w-4" />
                                    {auth.user.name}
                                </a>
                            ) : (
                                <a
                                    href="/login"
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                    onClick={() => setMobileMenu(false)}
                                >
                                    <LogIn className="h-4 w-4" />
                                    Login
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* =========================================================
                HERO
            ========================================================== */}
            <section className="relative overflow-hidden bg-slate-950 pt-20 text-slate-100">
                {/* Grid background */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
                        backgroundSize: "4rem 4rem",
                        maskImage:
                            "radial-gradient(ellipse 65% 60% at 50% 40%, #000 70%, transparent 100%)",
                    }}
                />

                {/* Orange glows */}
                <div className="pointer-events-none absolute left-[10%] top-0 h-[500px] w-[600px] -translate-y-1/3 rounded-full bg-orange-500/10 blur-[130px]" />
                <div className="pointer-events-none absolute bottom-0 right-[10%] h-[400px] w-[500px] rounded-full bg-amber-500/10 blur-[130px]" />

                <div className="relative z-10 mx-auto grid max-w-7xl items-end gap-10 px-4 pb-0 pt-16 sm:px-6 md:grid-cols-12 md:pt-20 lg:px-8">
                    {/* HERO LEFT */}
                    <div className="pb-12 md:col-span-7 md:pb-24">
                        {/* Badge */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-800/40 bg-orange-950/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-orange-300 backdrop-blur">
                            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                            Sistem Pengaduan Infrastruktur
                        </div>

                        {/* Heading */}
                        <h1 className="max-w-3xl text-[38px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[50px] lg:text-[60px]">
                            Bersama Menjaga{" "}
                            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                                Jalan Tetap Terang
                            </span>{" "}
                            dan Aman.
                        </h1>

                        {/* Description */}
                        <p className="mt-6 max-w-2xl text-sm leading-[1.7] text-slate-400 sm:text-base md:text-lg">
                            ARUNIKA hadir untuk memudahkan masyarakat melaporkan
                            gangguan lampu jalan dan traffic light secara cepat,
                            transparan, dan terintegrasi hingga ditangani oleh
                            tim teknis di lapangan.
                        </p>

                        <div className="mt-9">
                            <div className="flex items-center gap-4">
                                <a
                                    href={downloadLinks.googlePlay}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Download ARUNIKA di Google Play"
                                >
                                    <img
                                        src="/playstore.png"
                                        alt="Google Play"
                                        className="h-12 transition-transform hover:scale-105"
                                    />
                                </a>
                                <a
                                    href={downloadLinks.appStore}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Download ARUNIKA di App Store"
                                >
                                    <img
                                        src="/appstore.png"
                                        alt="App Store"
                                        className="h-12 transition-transform hover:scale-105"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* HERO RIGHT - BUPATI & WAKIL */}
                    <div className="relative flex justify-center md:col-span-5 md:self-end">
                        <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
                        <img
                            src="/bupati-dan-wakil.png"
                            alt="Bupati dan Wakil Bupati"
                            loading="eager"
                            className="relative z-10 max-h-[380px] w-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.7)] md:max-h-none md:w-full"
                        />
                    </div>
                </div>
            </section>

            {/* =========================================================
                FEATURE CARDS
            ========================================================== */}
            <section className="relative bg-white py-10">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:px-6 sm:grid-cols-3 lg:px-8">
                    <FeatureCard
                        icon={Lightbulb}
                        title="Lampu Jalan"
                        description="Laporkan lampu jalan mati, rusak, atau membutuhkan perbaikan."
                    />
                    <FeatureCard
                        icon={TrafficCone}
                        title="Traffic Light"
                        description="Laporkan traffic light yang tidak berfungsi atau mengalami gangguan."
                    />
                    <FeatureCard
                        icon={MapPin}
                        title="Berbasis Lokasi"
                        description="Setiap laporan dilengkapi lokasi sehingga lebih mudah ditindaklanjuti."
                    />
                </div>
            </section>

            {/* =========================================================
                FLOW (CARA KERJA)
            ========================================================== */}
            <section className="bg-orange-50/50 py-20 md:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Heading */}
                    <div className="mx-auto mb-14 max-w-2xl text-center">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                            Cara Kerja ARUNIKA
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                            Dari Laporan Hingga Selesai Ditangani
                        </h2>
                        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 md:text-base">
                            Ikuti proses pengaduan dengan mudah dan pantau
                            perkembangan laporan Anda secara transparan.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.id}
                                    className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
                                >
                                    {/* Connector */}
                                    {index < steps.length - 1 && (
                                        <div className="absolute left-[85%] top-[51px] hidden w-[30%] border-t border-dashed border-orange-300 lg:block" />
                                    )}

                                    {/* Icon + number */}
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${step.color}`}
                                        >
                                            <Icon className="h-5 w-5 stroke-[2]" />
                                        </div>
                                        <span className="font-mono text-2xl font-black text-orange-200 transition group-hover:text-orange-300">
                                            {step.id}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 mt-5">
                                        <h3 className="text-sm font-bold text-slate-800 transition group-hover:text-orange-600">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500 md:text-sm">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* =========================================================
                FOOTER
            ========================================================== */}
            <footer className="border-t border-slate-800 bg-slate-950">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div className="flex items-center gap-3">
                        <img
                            src="/beraksi-logo.webp"
                            alt="Logo BERAKSI"
                            className="h-9 w-auto object-contain"
                        />
                        <div>
                            <div className="text-sm font-bold text-white">
                                ARUNIKA
                            </div>
                            <div className="text-[10px] text-slate-500">
                                Sistem Pengaduan Lampu Jalan & Traffic Light
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500">
                        © {new Date().getFullYear()} ARUNIKA. Semua hak
                        dilindungi.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}