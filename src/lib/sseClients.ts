// src/lib/sseClients.ts
type Client = { id: string; email: string; send: (data: any) => void };

// Global In-memory list of connected SSE-clients
const globalForSSE = globalThis as unknown as { sseClients?: Client[] };
export const sseClients: Client[] = globalForSSE.sseClients || [];
if (!globalForSSE.sseClients) globalForSSE.sseClients = sseClients;

/**
 * Registers a new SSE client with its email, and cleans up when disconnected.
 */
export const registerClient = (id: string, email: string, send: (data: any) => void, signal: AbortSignal) => {
    sseClients.push({ id, email, send });

    signal.addEventListener("abort", () => {    // Handle client disconnect (when stream is closed)
        const idx = sseClients.findIndex((c) => c.id === id);
        if (idx !== -1) sseClients.splice(idx, 1);         // Remove the client from list, when he disconnects...
    });
};

/**
 * Broadcasts an 'SSE-event' to all connected SSE clients of only a specific user's 'email'.
 */
export const broadcast = (email: string, data: any) => {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    const targetClients = sseClients.filter((c) => c.email === email);  // Only Send to a specific user/owner client of an email...

    for (const client of targetClients) {
        try {
            client.send(payload);   // Send an SSE-event to a client of an email...
        } catch (e) {
            console.error("SSE send error:", e);
        }
    }
};
