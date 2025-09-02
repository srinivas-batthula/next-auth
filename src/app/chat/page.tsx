"use client";

import { useState } from "react";

interface Message {
    role: "user" | "bot";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    async function sendMessage() {
        if (!input.trim()) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(
                `https://api-inference.huggingface.co/models/distilbert-base-uncased`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.HF_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ inputs: input }),
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            const data = await res.json();
            const botText = data?.response?.[0]?.generated_text || JSON.stringify(data);

            setMessages((prev) => [...prev, { role: "bot", content: botText }]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: "bot", content: "❌ Error fetching response" }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">🤖 Hugging Face Chat</h1>

            <div className="w-full max-w-lg bg-white shadow-md rounded-xl p-4 mb-4 h-96 overflow-y-auto">
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

            <div className="flex gap-2 w-full max-w-sm" style={{width:'60%'}}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg"
                    style={{borderRadius:'20px', height:'3rem'}}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    style={{borderRadius:'20px', height:'3rem', width:'4rem'}}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
