import OpenAI from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY
});

// POST handler for the API endpoint
export async function POST(request: Request) {
    try {
        // Parse the request body
        const body = await request.json();
        const { messages, model } = body;

        // Validate input
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Create chat completion with higher max_tokens for longer conversations
        const completion = await openai.chat.completions.create({
            messages,
            model: model === 'chat' ? 'deepseek-chat-33b' : 'deepseek-reasoner',
            temperature: 0.7,
            max_tokens: 4000,  // Increased for longer responses
            presence_penalty: 0.6,  // Add some penalty for repetition
            frequency_penalty: 0.6   // Add penalty for frequent token usage
        });

        // Return the response
        return NextResponse.json(completion.choices[0].message);

    } catch (error: any) {
        console.error('DeepSeek API error:', error.message);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}