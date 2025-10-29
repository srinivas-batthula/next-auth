// app/api/ai/route.ts
import { NextResponse } from "next/server";
import axios from "axios";


const PROVIDERS = ['huggingFace', 'openRouter', 'Gemini', 'sambaNova', 'groqCloud'] as const;
type Provider = typeof PROVIDERS[number];

const models: Record<Provider, string> = {                            // Models used in each Provider...
    huggingFace: 'distilbert-base-uncased',
    openRouter: 'mistralai/mistral-7b-instruct',
    Gemini: 'gemini-1.5-flash',
    sambaNova: 'DeepSeek-R1-0528',
    groqCloud: 'openai/gpt-oss-20b'
}

interface AIRequest {
    input: string;
    opt: Provider;
}

export async function POST(req: Request) {
    try {
        const { input, opt } = (await req.json()) as AIRequest;

        let response: string;
        if (opt === "huggingFace") {
            response = await callHuggingFace(input);
        }
        else if (opt === "openRouter") {
            response = await callOpenRouter(input);
        }
        else if (opt === "Gemini") {
            response = await callGemini(input);
        }
        else if (opt === "sambaNova") {
            response = await callSambaNova(input);
        }
        else if (opt === "groqCloud") {
            response = await callGroqCloud(input);
        }
        else {
            return NextResponse.json(
                { error: "Invalid model selected at `opt`!" },
                { status: 400 }
            );
        }

        return NextResponse.json({ response });
    } catch (err: any) {
        console.error(err.response?.data || err.message);
        return NextResponse.json(
            { error: err.response?.data || err.message },
            { status: err.response?.status || 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ message: "/api/ai : GET working successfully!" });
}


// ------Helpers for each AI-Models-------
async function callHuggingFace(input: string) {
    const HF_URL = `https://api-inference.huggingface.co/models/${models.huggingFace}`;  // Base & Test Model :==> https://api-inference.huggingface.co/models/distilbert-base-uncased

    const res = await axios.post(
        HF_URL,
        { inputs: input },                        // body
        {
            headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );
    // Hugging Face returns an array
    return res.data?.[0]?.generated_text?.trim() || "No response from Hugging Face";
}

async function callOpenRouter(input: string) {
    const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    const res = await axios.post(
        OPENROUTER_URL,
        {
            model: models.openRouter,                        // body
            max_tokens: 200,
            messages: [{ role: "user", content: input }],
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );
    return (
        res.data?.choices?.[0]?.message?.content?.trim() ||
        "No response from OpenRouter"
    );
}

async function callGemini(input: string) {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${models.Gemini}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const res = await axios.post(
        GEMINI_URL,
        {
            contents: [
                {
                    role: "user",
                    parts: [                        // body
                        { text: input }
                    ]
                }
            ]
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return (
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text.trim() ||
        "No response from OpenRouter"
    );
}

async function callSambaNova(input: string) {
    const SAMBANOVA_URL = "https://api.sambanova.ai/v1/chat/completions";

    const res = await axios.post(
        SAMBANOVA_URL,
        {
            stream: false,                              // Stream handling is omitted here.
            model: models.sambaNova,
            messages: [
                {
                    role: "system",                                      // body
                    content: "You are a helpful assistant"
                },
                {
                    role: "user",
                    content: input
                }
            ]
        },
        {
            headers: {
                "Authorization": `Bearer ${process.env.SAMBANOVA_API_KEY}`,
                "Content-Type": "application/json"
            }
        }
    );
    
    const rawText = res.data?.choices?.[0]?.message?.content?.trim() || "No response from SambaNova";
    return (
        rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim() ||
        "No response from SambaNova"
    );
}

async function callGroqCloud(input: string) {
    const GROQCLOUD_URL = "https://api.groq.com/openai/v1/chat/completions";

    const res = await axios.post(
        GROQCLOUD_URL,
        {
            model: models.groqCloud,
            messages: [
                {
                    role: "user",                                      // body
                    content: input
                }
            ],
            max_tokens: 200,
        },
        {
            headers: {
                "Authorization": `Bearer ${process.env.GROQCLOUD_API_KEY}`,
                "Content-Type": "application/json"
            }
        }
    );

    return (
        res.data?.choices?.[0]?.message?.content?.trim() ||
        "No response from GroqCloud"
    );
}
