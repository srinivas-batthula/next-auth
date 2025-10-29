"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function SignUpForm() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        alert(data?.message);

        if (res.ok && data.success) {
            setTimeout(() => {
                router.push(`${process.env.NEXT_PUBLIC_HOME}/login`);
                setForm({ username: '', email: '', password: '' });
            }, 2000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Name" required style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '0.7rem', paddingLeft: '0.4rem', marginBottom: '0.5rem' }} />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" required style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '0.7rem', paddingLeft: '0.4rem', marginBottom: '0.5rem' }} />
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" required style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '0.7rem', paddingLeft: '0.4rem', marginBottom: '0.5rem' }} />
            <button type="submit" style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '1.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>Sign Up</button>
        </form>
    );
}
