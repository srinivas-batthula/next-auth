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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2" style={{marginBottom:'3rem'}}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{height:'2.5rem', fontSize:'1.1rem', borderRadius:'0.7rem', paddingLeft:'0.4rem', marginBottom:'0.5rem'}} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{height:'2.5rem', fontSize:'1.1rem', borderRadius:'0.7rem', paddingLeft:'0.4rem', marginBottom:'0.5rem'}} />
            <button type="submit" style={{height:'2.5rem', fontSize:'1.1rem', borderRadius:'1.5rem', marginBottom:'0.5rem', cursor:'pointer'}}>Sign In</button>

            {/* OAuth btns... */}
            <h2 style={{marginTop:'2rem'}}>Login (OAuth)</h2>
            <button type="button" onClick={() => signIn("google", { callbackUrl: "/profile" })} style={{height:'2.5rem', fontSize:'1.1rem', borderRadius:'1.5rem', marginBottom:'0.5rem', cursor:'pointer'}}>
                Sign In with Google
            </button>
        </form>
    );
}
