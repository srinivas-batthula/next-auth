// app/layout.tsx
import "../globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "NextAuth & ChatBots",
    description: "Scalable Next.js + NextAuth + MongoDB Auth & Chatbot LLM's Setup",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-50 text-gray-900`} style={{width:'100%', height:'100vh', display:'flex', justifyContent:'center', alignContent:'center', flexDirection:'column'}}>
                {/* Wrap the 'whole App' in 'Providers', So 'NextAuth Session' is available 'globally'... */}
                <Providers>
                    <div className="min-h-screen flex flex-col">
                        <header className="w-full py-4 shadow-sm bg-white">
                            <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
                                <h1 className="text-xl font-bold">NextAuth Mini-App</h1>
                                <nav style={{display:'flex', justifyContent:'center', gap:'3rem', flexDirection:'row', paddingRight:'1rem'}}>
                                    <a href="/" className="hover:underline">Home</a>
                                    <a href="/chat" className="hover:underline">AI Chat</a>
                                    <a href="/api/auth/signin" className="hover:underline">Login (NextAuth)</a>
                                    <a href="/login" className="hover:underline">Login (Manual)</a>
                                    <a href="/profile" className="hover:underline">Profile</a>
                                </nav>
                            </div>
                        </header>
                        <main className="flex-1 max-w-4xl mx-auto w-full p-4" style={{marginTop:'3rem'}}>{children}</main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
