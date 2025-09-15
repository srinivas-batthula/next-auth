"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";


export default function ResetPassword() {
    const router = useRouter();
    const params = useParams();
    const username = params.username as string; // 'username'...

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState(false);
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password.length === 0) {
            setStatus(false);
            setMsg("Password is required!");
            return;
        }
        if (password !== confirmPassword) {
            setStatus(false);
            setMsg("`Password` and `Confirm-Password` must be Same!");
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            setStatus(data.success);
            setMsg(data?.msg);

            if (res.ok && data.success) {
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        }
        catch (err) {
            setStatus(false);
            setMsg("Server Error!");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2" style={{ marginBottom: '3rem' }}>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your New Password" required style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '0.7rem', paddingLeft: '0.4rem', marginBottom: '0.5rem' }} />
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your New Password" required style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '0.7rem', paddingLeft: '0.4rem', marginBottom: '0.5rem' }} />
            <button type="submit" style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '1.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>Submit</button>

            <h3 style={{ marginTop: '2rem', color: (status) ? 'green' : 'red' }}>{msg}</h3>
        </form>
    );
}
