// Netlify Function: /api/apply-fix
// Applies selected fixes to code using Claude API

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// CORS headers
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
2. A list of fixes to apply (each with before/after code snippets)

Your response MUST be valid JSON matching this exact structure:
{
  "fixedCode": "<the complete code with all requested fixes applied>",
  "appliedCount": <number of fixes successfully applied>,
  "appliedFixes": ["<id of fix applied>", ...]
}

Guidelines:
1. Apply ONLY the fixes that were requested
2. Maintain the original code structure and style
3. If a fix before/after doesn't match the code exactly, try to apply it intelligently
4. The fixedCode should be complete and runnable
5. Preserve comments and formatting where possible
6. If no fixes could be applied, return the original code unchanged

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
        const { code, fixes, fixIds } = body;

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

        // Support both fixes array and fixIds
        const fixesToApply = fixes || [];

        if (fixesToApply.length === 0 && (!fixIds || fixIds.length === 0)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing fixes. Please specify which fixes to apply.',
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
        let userMessage = `Please apply these fixes to the code:\n\n`;

        if (fixesToApply.length > 0) {
            userMessage += `Fixes to apply:\n`;
            fixesToApply.forEach((fix, i) => {
                userMessage += `\nFix ${i + 1}:\n`;
                userMessage += `Before:\n\`\`\`\n${fix.before}\n\`\`\`\n`;
                userMessage += `After:\n\`\`\`\n${fix.after}\n\`\`\`\n`;
            });
        } else if (fixIds) {
            userMessage += `Fix IDs to apply: ${JSON.stringify(fixIds)}\n`;
        }

        userMessage += `\nOriginal code:\n\`\`\`\n${code}\n\`\`\`\n\nApply the fixes and return the result as JSON.`;

        // Call Claude API
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            messages: [
                {
                    role: 'user',
                    content: userMessage,
                },
            ],
            system: SYSTEM_PROMPT,
        });

        // Extract text content
        const textContent = response.content.find((block) => block.type === 'text');
        if (!textContent || !textContent.text) {
            throw new Error('No text response from Claude');
        }

        // Parse JSON response
        let fixResult;
        try {
            let jsonText = textContent.text.trim();
            // Remove markdown if present
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.slice(7);
            }
            if (jsonText.startsWith('```')) {
                jsonText = jsonText.slice(3);
            }
            if (jsonText.endsWith('```')) {
                jsonText = jsonText.slice(0, -3);
            }
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            fixResult = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('Failed to parse Claude response:', textContent.text);
            throw new Error('Failed to parse fix results');
        }

        // Validate response
        if (typeof fixResult.fixedCode !== 'string') {
            throw new Error('Invalid response structure from Claude');
        }

        // Ensure fields exist
        fixResult.appliedCount = typeof fixResult.appliedCount === 'number' ? fixResult.appliedCount : fixesToApply.length;
        fixResult.appliedFixes = fixResult.appliedFixes || [];

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(fixResult),
        };
    } catch (error) {
        console.error('Apply-fix API error:', error);

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
