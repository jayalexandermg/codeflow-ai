// Netlify Function: /api/apply-fix
// Applies selected fixes to code using Claude API
// See ADR: types.ts for ApplyFixResponse interface

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// CORS headers for cross-origin requests
const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// System prompt for applying fixes
const SYSTEM_PROMPT = `You are an expert code fixer. Your job is to apply the requested fixes to the provided code.

You will receive:
1. Original code
2. A list of fix IDs to apply (these reference issues, suggestions, or changes from a previous review)

Your response MUST be valid JSON matching this exact structure:
{
  "fixedCode": "<the complete code with all requested fixes applied>",
  "appliedFixes": ["<id of fix that was applied>", ...],
  "remainingIssues": <number of issues that still need attention>
}

Guidelines:
1. Apply ONLY the fixes that were requested by ID
2. Maintain the original code structure and style
3. If a fix ID doesn't make sense for the code, skip it (don't include in appliedFixes)
4. The fixedCode should be complete and runnable
5. remainingIssues should estimate how many code quality issues remain
6. Preserve comments and formatting where possible
7. If no fixes could be applied, return the original code unchanged

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations, just the JSON object.`;

export async function handler(event) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { code, fixIds } = body;

        // Input validation
        if (!code || typeof code !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing or invalid code. Please provide code to fix.',
                }),
            };
        }

        if (!fixIds || !Array.isArray(fixIds) || fixIds.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing or invalid fixIds. Please specify which fixes to apply.',
                }),
            };
        }

        if (code.length > 50000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Code too long. Maximum 50,000 characters allowed.',
                }),
            };
        }

        // Build the user message
        const userMessage = `Please apply these fixes to the code:

Fix IDs to apply: ${JSON.stringify(fixIds)}

Original code:
\`\`\`
${code}
\`\`\`

Apply the fixes and return the result as JSON.`;

        // Call Claude API
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: userMessage,
                },
            ],
            system: SYSTEM_PROMPT,
        });

        // Extract the text content from Claude's response
        const textContent = response.content.find((block) => block.type === 'text');
        if (!textContent || !textContent.text) {
            throw new Error('No text response from Claude');
        }

        // Parse the JSON response
        let fixResult;
        try {
            // Try to extract JSON from the response
            const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            fixResult = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('Failed to parse Claude response:', textContent.text);
            throw new Error('Failed to parse fix results');
        }

        // Validate the response structure
        if (typeof fixResult.fixedCode !== 'string') {
            throw new Error('Invalid response structure from Claude');
        }

        // Ensure arrays and numbers exist
        fixResult.appliedFixes = fixResult.appliedFixes || [];
        fixResult.remainingIssues =
            typeof fixResult.remainingIssues === 'number' ? fixResult.remainingIssues : 0;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(fixResult),
        };
    } catch (error) {
        console.error('Apply-fix API error:', error);

        // User-friendly error messages
        let userMessage = 'Something went wrong while applying fixes. Please try again.';

        if (error.message?.includes('API key')) {
            userMessage = 'Server configuration error. Please contact support.';
        } else if (error.message?.includes('rate limit')) {
            userMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (error.message?.includes('parse')) {
            userMessage = 'We had trouble processing the fixes. Please try again.';
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: userMessage }),
        };
    }
}
