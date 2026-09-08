import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";

const ThankYouPage: React.FC = () => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isMoved, setIsMoved] = useState(false);

    const moveButton = () => {
        const newX = Math.floor(Math.random() * 600) - 300; // lebih ekstrem
        const newY = Math.floor(Math.random() * 400) - 200;
        setPos({ x: newX, y: newY });
        setIsMoved(true);
    };

    return (
        <>
            <Head title="Success Thank You" />
            <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white px-6 overflow-hidden">
                <h1 className="text-3xl font-bold mb-2">Terima Kasih</h1>
                <p className="text-slate-300 text-center mb-8">
                    Anda sudah berhasil mendaftar. Silakan login dengan akun
                    Anda untuk mulai menggunakan aplikasi.
                </p>

                <Link
                    href={route("login")}
                    onMouseEnter={moveButton}
                    style={{
                        transform: `translate(${pos.x}px, ${pos.y}px)`,
                        transition: "transform 0.3s ease",
                        position: isMoved ? "absolute" : "static", // awalnya normal di bawah teks
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    Login Sekarang
                </Link>
            </div>
        </>
    );
};

export default ThankYouPage;
