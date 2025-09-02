"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await signIn("credentials", { email, password, redirect: true, callbackUrl: "/profile" });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button type="submit">Sign In</button>
            <button type="button" onClick={() => signIn("google", { callbackUrl: "/profile" })}>
                Sign In with Google
            </button>
        </form>
    );
}
