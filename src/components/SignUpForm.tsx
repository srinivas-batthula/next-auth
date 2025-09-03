"use client";
import { useState } from "react";

export default function SignUpForm() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        alert("User created! You can log in now.");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required style={{height:'2.5rem', fontSize:'1.1rem', borderRadius:'0.7rem', paddingLeft:'0.4rem', marginBottom:'0.5rem'}} />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" required style={{height:'2.5rem', fontSize:'1.1rem', borderRadius:'0.7rem', paddingLeft:'0.4rem', marginBottom:'0.5rem'}} />
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" required style={{height:'2.5rem', fontSize:'1.1rem', borderRadius:'0.7rem', paddingLeft:'0.4rem', marginBottom:'0.5rem'}} />
            <button type="submit" style={{height:'2.5rem', fontSize:'1.1rem', borderRadius:'1.5rem', marginBottom:'0.5rem'}}>Sign Up</button>
        </form>
    );
}
