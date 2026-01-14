// Netlify Function: /api/review
// Analyzes code using Claude API

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { code, language } = JSON.parse(event.body);

        if (!code || code.length > 50000) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid code input' }),
            };
        }

        // TODO: Implement Claude API call with code review prompt
        // This is the stub - Agent 3 will implement the full logic

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'API stub - implement Claude integration' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
}
