// Netlify Function: /api/review
// Analyzes code using Claude API and returns structured review
// See ADR: types.ts for ReviewResponse interface

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

// System prompt for Claude to analyze code and return structured JSON
const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the provided code and return a JSON response with your review.

Your response MUST be valid JSON matching this exact structure:
{
  "score": <number 0-100>,
  "categories": {
    "security": <number 0-100>,
    "performance": <number 0-100>,
    "readability": <number 0-100>,
    "bestPractices": <number 0-100>
  },
  "issues": [
    {
      "id": "<unique-id>",
      "severity": "critical" | "warning",
      "line": <line number>,
      "title": "<short title>",
      "description": "<plain English explanation a non-developer can understand>"
    }
  ],
  "suggestions": [
    {
      "id": "<unique-id>",
      "title": "<short title>",
      "description": "<plain English explanation>",
      "codeSnippet": "<the improved code>"
    }
  ],
  "proposedChanges": [
    {
      "id": "<unique-id>",
      "title": "<short title>",
      "description": "<what this change does>",
      "diff": "<unified diff format showing the change>",
      "fixedCode": "<the complete fixed code for this section>",
      "lineStart": <starting line number>,
      "lineEnd": <ending line number>
    }
  ],
  "actionItems": [
    {
      "id": "<unique-id>",
      "priority": "high" | "low",
      "title": "<action to take>",
      "description": "<why this matters>",
      "relatedIssueId": "<optional issue id>",
      "relatedSuggestionId": "<optional suggestion id>",
      "relatedChangeId": "<optional change id>"
    }
  ]
}

Guidelines:
1. Score reflects overall code quality (100 = perfect, 0 = critical issues)
2. Category scores should reflect each area independently
3. Identify REAL issues - don't invent problems that don't exist
4. Explain everything in plain English that a non-developer can understand
5. For each issue, provide a specific line number where it occurs
6. Suggestions should include working code examples
7. Proposed changes should include unified diffs that can be applied
8. Action items should be prioritized by impact
9. Use unique IDs like "issue-1", "suggestion-1", "change-1", "action-1"
10. If the code is good, say so - don't force issues

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
        const { code, language, filename } = body;

        // Input validation
        if (!code || typeof code !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing or invalid code. Please provide code to review.',
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

        // Build the user message with code context
        let userMessage = 'Please review this code:\n\n```';
        if (language) {
            userMessage += language;
        }
        userMessage += '\n' + code + '\n```';

        if (filename) {
            userMessage += `\n\nFilename: ${filename}`;
        }
        if (language) {
            userMessage += `\nLanguage: ${language}`;
        }

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
        let reviewResult;
        try {
            // Try to extract JSON from the response (in case there's any surrounding text)
            const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            reviewResult = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('Failed to parse Claude response:', textContent.text);
            throw new Error('Failed to parse review results');
        }

        // Validate the response structure has required fields
        if (typeof reviewResult.score !== 'number' || !reviewResult.categories) {
            throw new Error('Invalid response structure from Claude');
        }

        // Ensure arrays exist even if empty
        reviewResult.issues = reviewResult.issues || [];
        reviewResult.suggestions = reviewResult.suggestions || [];
        reviewResult.proposedChanges = reviewResult.proposedChanges || [];
        reviewResult.actionItems = reviewResult.actionItems || [];

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(reviewResult),
        };
    } catch (error) {
        console.error('Review API error:', error);

        // User-friendly error messages
        let userMessage = 'Something went wrong while reviewing your code. Please try again.';

        if (error.message?.includes('API key')) {
            userMessage = 'Server configuration error. Please contact support.';
        } else if (error.message?.includes('rate limit')) {
            userMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (error.message?.includes('parse')) {
            userMessage = 'We had trouble understanding the review. Please try again.';
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: userMessage }),
        };
    }
}
