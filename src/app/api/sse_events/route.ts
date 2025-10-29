// app/api/events/route.ts
import { NextRequest } from "next/server";


// Enable streaming response
export const runtime = "nodejs"; // Required for long-lived connections

export async function GET(req: NextRequest) {
    // Create a ReadableStream that sends data over time...
    const stream = new ReadableStream({
        start(controller) {
            // Helper function to send an event message
            const sendEvent = (data: any) => {
                controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            };

            // Send initial connection message
            sendEvent({ message: "SSE connection established" });

            // send updates every 1.5-secs via SSE...
            const interval = setInterval(() => {
                const istTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
                const eventData = {
                    time: istTime,
                    random: Math.floor(Math.random() * 100),
                };
                sendEvent(eventData);
            }, 1500);

            // Handle client disconnect (when stream is closed)
            req.signal.addEventListener("abort", () => {
                clearInterval(interval);
                controller.close();
            });
        },
    });

    // Return SSE response headers
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
