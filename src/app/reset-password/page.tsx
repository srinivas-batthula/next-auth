// app/reset-password/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";


export default function ResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') as string;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState(false);
    const [msg, setMsg] = useState({ message: '', color: '' });

    useEffect(() => {   // On every refresh / new request, Validate `Token`...
        const validateToken = async (token: string) => {
            if (!token || token.trim().length === 0) {
                setMsg({ message: "Invalid or Missing Token!", color: "red" });
                setStatus(false);
                setTimeout(() => {
                    router.push('/login')
                }, 2000);
                return false;
            }
            const res = await fetch(`/api/auth/reset-password?token=${token}`);
            const data = await res.json();

            if (!res.ok || !data.success) {
                setMsg({ message: data.message, color: "red" });
                setStatus(false);
                setTimeout(() => {
                    router.push('/login')
                }, 2000);
                return false;
            }
            setMsg({ message: data.message, color: "green" });
            setStatus(true);
            return true;
        }
        validateToken(token);
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password.trim().length === 0) {
            setMsg({ message: "Password is required!", color: "red" });
            return;
        }
        if (password !== confirmPassword) {
            setMsg({ message: "`Password` and `Confirm-Password` must be Same!", color: "red" });
            return;
        }

        try {
            const res = await fetch(`/api/auth/reset-password?token=${token}`, {
                method: 'POST',
                body: JSON.stringify({ password }),
            });
            const data = await res.json();

            setStatus(!data.success);
            setMsg({ message: data.message, color: (data.success) ? "green" : "red" });

            if (res.ok && data.success) {
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        }
        catch (err: any) {
            setMsg({ message: err.message || "Server Error!", color: "red" });
        }
    };

    return (
        <div >
            {
                status && (<form onSubmit={handleSubmit} className="flex flex-col gap-2" style={{ marginBottom: '3rem' }}>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your New Password" required style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '0.7rem', paddingLeft: '0.4rem', marginBottom: '0.5rem' }} />
                    <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your New Password" required style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '0.7rem', paddingLeft: '0.4rem', marginBottom: '0.5rem' }} />
                    <button type="submit" style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '1.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>Submit</button>
                </form>)
            }

            <h3 style={{ marginTop: '2rem', color: msg.color }}>{msg.message}</h3>
        </div>
    );
}
