// src/components/SignInForm.tsx
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function SignInForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/profile" });

        if (res?.ok && res.url) {
            router.push(res.url); // manually redirect on success
        }
        else {
            setError(res?.error || "Login failed!");
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || email.length === 0 || email === '') {   // 'email' Check...
            setError('Email is required for `Forgot-Password`!');
            return;
        }

        const resp = await fetch('/api/auth/sendEmail', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        const res = await resp.json();

        if (resp.ok && res.success) {
            router.push(`/verify-email/${email}?q=forgotPassword`); // manually redirect on success
        }
        else {
            setError(res?.message || "Failed to send email!");
        }
    };

    return (
        <>
            <div>
                <h3>Error : </h3>
                <p style={{ color: 'red' }}>{error === "CredentialsSignin" ? "Invalid credentials" : error}</p>
            </div>
            <br />
            <form onSubmit={handleSubmit} className="flex flex-col gap-2" style={{ marginBottom: '3rem' }}>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email or Username..." required style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '0.7rem', paddingLeft: '0.4rem', marginBottom: '0.5rem' }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '0.7rem', paddingLeft: '0.4rem', marginBottom: '0.5rem' }} />
                <button type="submit" style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '1.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>Sign In</button>

                {/* Forgot Password Btn... */}
                <button type="button" onClick={(e) => handleForgotPassword(e)} style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '1.5rem', marginBottom: '0.5rem', marginTop: '0.5rem', cursor: 'pointer' }}>Forgot Password</button>

                {/* OAuth btns... */}
                <h2 style={{ marginTop: '2rem' }}>Login (OAuth)</h2>
                <button type="button" onClick={() => signIn("google", { callbackUrl: "/profile" })} style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '1.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                    Sign In with Google
                </button>
                <button type="button" onClick={() => signIn("github", { callbackUrl: "/profile" })} style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '1.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                    Sign In with GitHub
                </button>
            </form>
        </>
    );
}
