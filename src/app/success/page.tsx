"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";


// helper component to display on Successful Registration && handle SSE...
export default function RegistrationSuccess() {
    const router = useRouter();
    const params = useSearchParams();
    const email = params?.get("email");

    useEffect(() => {
        if (!email) return;

        // Open SSE-events connection over a specific user's email...
        const eventSource = new EventSource(`/api/auth/register?email=${email}`);

        // Handle events/messages...
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "EMAIL_VERIFIED" && data.email === email) {
                console.log("Email Verified SSE-event received: ", data);
                router.push(`${process.env.NEXT_PUBLIC_HOME}/login`); // After successful verification, Redirect to `/login`...
            }
        };
        eventSource.onerror = (err) => {
            console.error("SSE error:   ", err);
            eventSource.close();
        };

        return () => eventSource.close();
    }, [email]);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconContainer}>
                    <div style={styles.checkmark}>✓</div>
                </div>
                <h2 style={styles.title}>Registration Successful!</h2>
                <p style={styles.message}>
                    Email sent — please verify your email to continue to login.
                </p>
                <button style={styles.button} onClick={() => alert("Redirecting to login...")}>
                    Go to Login
                </button>
            </div>
            <p>Note: Upon Successful email verification, the page is automatically redirects to `/login`</p>
        </div>
    );
};

// Inline styles
const styles: Record<string, any> = {
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background:
            "linear-gradient(135deg, #e0f7fa 0%, #80deea 50%, #4dd0e1 100%)",
        padding: "20px",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        textAlign: "center" as const,
        maxWidth: "400px",
        width: "100%",
        padding: "30px 25px",
        transition: "transform 0.3s ease",
    },
    iconContainer: {
        backgroundColor: "#4caf50",
        borderRadius: "50%",
        width: "70px",
        height: "70px",
        margin: "0 auto 20px auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    checkmark: {
        color: "#fff",
        fontSize: "36px",
        fontWeight: "bold",
    },
    title: {
        fontSize: "1.6rem",
        color: "#333",
        marginBottom: "10px",
    },
    message: {
        fontSize: "1rem",
        color: "#555",
        lineHeight: "1.5",
        marginBottom: "25px",
    },
    button: {
        backgroundColor: "#00796b",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "12px 20px",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "background 0.3s ease",
        '&:hover': {
            backgroundColor: "#004d40"
        }
    },
};
