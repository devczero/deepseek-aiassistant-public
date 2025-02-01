type Message = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

export async function generateDeepSeekContent(messages: Message[], model: 'reasoner' | 'chat') {
    try {
        const response = await fetch('/api/deepseek', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages, model }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate content');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating content:', error);
        throw error;
    }
} 