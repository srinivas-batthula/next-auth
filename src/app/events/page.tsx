// app/page.tsx
"use client";

import { useEffect, useState } from "react";


export default function Page() {
    const [event, setEvent] = useState<any>();

    useEffect(() => {
        // Open SSE connection to our Next.js API route
        const eventSource = new EventSource("/api/sse_events");

        // On receiving a new message from the server
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event?.data);
            setEvent(data);
            console.log(`SSE -> ${JSON.stringify(data)}`);
        };

        // Handle errors or closed connection
        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        };

        // Cleanup when component unmounts
        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', marginTop: '2.5rem' }}>
            <div><h1>🔴 Live Server Events (SSE from Backend-API)</h1></div>

            <div style={{ fontSize: '1.2rem' }}>
                <p style={{ margin: '0.5rem' }}><strong>🕒Time:</strong> {event?.time}</p>
                <p style={{ margin: '0.5rem' }}><strong>Random number:</strong> {event?.random}</p>
            </div>
        </div>
    );
}
