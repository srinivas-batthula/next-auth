import Link from "next/link";

export default function Home() {
    return (
        <main style={{width:'100%',display:'flex', justifyContent:'center', alignContent:'center', flexDirection:'column'}}>
            <h1>Welcome</h1>
            <h3>to the NextJs <strong>(NextAuth Tutorial)</strong> Landing Page!</h3>
            <br />
            <Link href="/login">Go to Login (manual)</Link>
            <Link href="/chat">Go to AI-Chat</Link>
        </main>
    );
}
