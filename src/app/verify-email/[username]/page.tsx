"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";


export default function Verify() {
    const router = useRouter();
    const params = useParams();
    const username = params.username as string;
    const [otp, setOTP] = useState("");
    const [status, setStatus] = useState(false);
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setStatus(false);
            setMsg("OTP length must be '6'!");
            return;
        }
        try {
            const res = await fetch('/api/auth/verify-code', {
                method: 'POST',
                body: JSON.stringify({ username, code: otp }),
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
            <input value={otp} onChange={(e) => setOTP(e.target.value)} placeholder="Enter your 6-digit OTP..." required style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '0.7rem', paddingLeft: '0.4rem', marginBottom: '0.5rem' }} />
            <button type="submit" style={{ height: '2.5rem', fontSize: '1.1rem', borderRadius: '1.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>Verify</button>

            {/* OAuth btns... */}
            <h3 style={{ marginTop: '2rem', color: (status) ? 'green' : 'red' }}>{msg}</h3>
        </form>
    );
}
