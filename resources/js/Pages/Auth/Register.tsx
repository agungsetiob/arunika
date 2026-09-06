import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";

export default function Register() {
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.visit(route('register.fake'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        name="name"
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={""} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={""} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={""} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={""} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route("login")}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900"
                    >
                        Already registered?
                    </Link>

                    <Link
                        href={route("register.fake")}
                        className="ms-4 px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                        Register
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
