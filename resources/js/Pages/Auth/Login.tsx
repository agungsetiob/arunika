import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { LogIn, Sparkles, User, Lock } from "lucide-react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Head title="Log in" />

            {/* =========================================================
                BACKGROUND EFFECTS
            ========================================================== */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
                        backgroundSize: "4rem 4rem",
                    }}
                />
                <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[130px]" />
                <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[130px]" />
            </div>

            {/* =========================================================
                MAIN CONTAINER
            ========================================================== */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl lg:grid-cols-2">
                    
                    {/* =====================================================
                        LEFT SIDE - BRANDING & ILLUSTRATION
                    ====================================================== */}
                    <div className="relative hidden flex-col items-center justify-center bg-gradient-to-br from-orange-600/20 via-amber-600/10 to-transparent p-12 lg:flex">
                        {/* Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                        
                        <div className="relative z-10 w-full space-y-8 text-center">
                            {/* Logo */}
                            <div className="flex justify-center">
                                <img
                                    src="/beraksi-logo.webp"
                                    alt="Logo BERAKSI"
                                    className="h-20 w-auto object-contain drop-shadow-lg"
                                />
                            </div>
                            
                            {/* Title */}
                            <div>
                                <h2 className="text-4xl font-extrabold tracking-tight text-white">
                                    ARUNIKA
                                </h2>
                                <p className="mt-2 text-sm font-medium uppercase tracking-widest text-orange-300">
                                    Smart PJU System
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />

                            {/* Bupati & Wakil */}
                            <div className="mt-6 flex justify-center">
                                <img
                                    src="/bupati-dan-wakil.png"
                                    alt="Bupati dan Wakil Bupati"
                                    className="max-h-48 w-auto object-contain drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        RIGHT SIDE - LOGIN FORM
                    ====================================================== */}
                    <div className="flex w-full flex-col justify-center p-8 sm:p-12 lg:p-16">
                        <div className="mx-auto w-full max-w-sm">
                            {/* Mobile Logo (visible only on small screens) */}
                            <div className="mb-8 flex flex-col items-center lg:hidden">
                                <img
                                    src="/beraksi-logo.webp"
                                    alt="Logo BERAKSI"
                                    className="h-16 w-auto object-contain"
                                />
                                <h2 className="mt-3 text-2xl font-bold text-white">
                                    ARUNIKA
                                </h2>
                                <p className="text-xs font-medium uppercase tracking-widest text-orange-300">
                                    Smart PJU System
                                </p>
                            </div>

                            {/* Form Header */}
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white">
                                    Masuk ke Akun
                                </h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    Silakan masukkan email dan password Anda
                                </p>
                            </div>

                            {/* Status message */}
                            {status && (
                                <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                {/* Email */}
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email"
                                        className="text-sm font-medium text-slate-300"
                                    />
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <User className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="block w-full rounded-xl border-slate-700 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                                            placeholder="nama@email.com"
                                            autoComplete="username"
                                            isFocused={true}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                        />
                                    </div>
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                        className="text-sm font-medium text-slate-300"
                                    />
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Lock className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <TextInput
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="block w-full rounded-xl border-slate-700 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Remember me */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData(
                                                    "remember",
                                                    (e.target.checked ||
                                                        false) as false,
                                                )
                                            }
                                            className="border-slate-700 bg-slate-900/50 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="ms-2 text-sm text-slate-300">
                                            Ingat saya
                                        </span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="text-sm text-orange-400 hover:text-orange-300 hover:underline"
                                        >
                                            Lupa password?
                                        </Link>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Masuk
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}