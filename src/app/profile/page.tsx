"use client";
import { useSession, signOut } from "next-auth/react";

export default function ProfilePage() {
    const { data: session } = useSession();
    if (!session) return <p>Loading...</p>;
    return (
        <div>
            <h1>Hello {session.user?.name}</h1>
            <p>{session.user?.email}</p>
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 bg-red-500 text-white rounded">
                Logout
            </button>
        </div>
    );
}
