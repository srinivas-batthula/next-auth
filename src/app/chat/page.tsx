"use client";

import { useState } from "react";
import { Provider, models, PROVIDERS } from "../api/ai/route";

interface Message {
    role: "user" | "bot";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState<Provider>("huggingFace");

    async function sendMessage() {
        if (!input.trim()) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(
                '/api/ai',
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ input, opt: provider }),
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            const data = await res.json();
            const botText = data?.response;

            setMessages((prev) => [...prev, { role: "bot", content: botText }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "bot", content: "❌ Error fetching response" }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100" style={{ height: '100vh', position: 'relative', color:'black' }}>
            <h1 className="text-2xl font-bold mb-4" style={{fontWeight:'bolder', color:'#505050'}}>🤖 <span style={{fontSize:'1.7rem', fontWeight:'bold', color:'black'}}>{ models[provider] }</span> AI-Model</h1>

            <div className="w-full max-w-lg bg-white shadow-md rounded-xl p-4 mb-4 h-96 overflow-y-auto" style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-2 mb-2 rounded-lg ${msg.role === "user" ? "bg-blue-100 text-right" : "bg-gray-200 text-left"
                            }`}
                    >
                        {msg.content}
                    </div>
                ))}
                {loading && <p className="text-gray-500 italic">Thinking...</p>}
            </div>

            <div className="flex gap-2 w-full max-w-sm" style={{ width: '50%', display: 'flex', gap: '0.3rem', position: 'fixed', bottom: '0', marginBottom: '1rem' }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    required
                    className="flex-1 p-2 border rounded-lg"
                    style={{ borderRadius: '1rem', height: '3rem', fontSize: '1.1rem', paddingLeft: '0.6rem' }}
                />

                {/* Dropdown */}
                <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as Provider)}
                    className="border rounded-lg px-3 py-2"
                    style={{ borderRadius: '1rem', padding: '0.3rem', fontSize: '1rem' }}
                >
                    {PROVIDERS.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                    ))}
                </select>

                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    style={{ borderRadius: '1rem', height: '2.8rem', width: '5rem', fontSize: '1.1rem' }}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send"}
                </button>
            </div>
        </div>
    );
}
