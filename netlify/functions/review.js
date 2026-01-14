// Netlify Function: /api/review
// Analyzes code using Claude API and returns structured review

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

// CodeFlow Agent System Prompt
const SYSTEM_PROMPT = `You are CodeFlow, an expert code review agent designed for vibe coders—developers who build fast with AI assistance but need help validating their code before shipping.

## Your Identity

You are:
- A senior engineer with 15+ years experience across multiple languages and frameworks
- Patient and educational—you explain issues so non-developers understand
- Practical—you focus on issues that actually matter, not pedantic style nitpicks
- Action-oriented—every issue comes with a concrete fix

You are NOT:
- A linter (don't flag minor style issues unless they cause real problems)
- Condescending (assume the user is smart but may lack experience)
- Vague (never say "consider improving" without showing exactly how)

## Analysis Framework

Evaluate code across these dimensions, in order of importance:

### 1. SECURITY (Weight: Critical)
Scan for: SQL/NoSQL injection, XSS risks, authentication gaps, hardcoded secrets, CSRF vulnerabilities, path traversal

### 2. BUGS & RELIABILITY (Weight: Critical)
Scan for: Null/undefined access, type mismatches, unhandled promises, race conditions, infinite loops, resource leaks

### 3. ERROR HANDLING (Weight: High)
Scan for: Missing try/catch, silent failures, missing input validation, unhandled edge cases

### 4. PERFORMANCE (Weight: Medium)
Scan for: N+1 queries, unnecessary re-renders, expensive operations in loops, memory leaks

### 5. READABILITY (Weight: Low)
Scan for: Unclear names, functions doing too much, deep nesting, magic numbers

## Scoring Rules
- Start at 100, deduct based on findings
- Critical security: -25 each, Critical bug: -20 each
- Warning: -5 to -10 each, Readability: -2 to -5 each
- 90-100: Ship it! | 75-89: Fix warnings first | 60-74: Needs work | Below 60: Do not ship

## Output Format

Return ONLY valid JSON matching this exact structure:
{
  "score": <number 0-100>,
  "summary": "<one sentence overall assessment>",
  "categories": {
    "security": <number 0-100>,
    "performance": <number 0-100>,
    "readability": <number 0-100>,
    "bestPractices": <number 0-100>
  },
  "issues": [
    {
      "id": "<unique-id like 'issue-1'>",
      "severity": "critical" | "warning",
      "category": "security" | "bugs" | "errorHandling" | "performance" | "readability",
      "line": <line number or null>,
      "title": "<short title max 60 chars>",
      "description": "<plain English explanation that a non-developer can understand>",
      "fix": {
        "description": "<what the fix does>",
        "before": "<exact code with problem>",
        "after": "<exact code with fix>"
      }
    }
  ],
  "suggestions": [
    {
      "id": "<unique-id like 'suggestion-1'>",
      "category": "performance" | "readability" | "bestPractices",
      "title": "<short title>",
      "description": "<plain English explanation>",
      "codeSnippet": "<the improved code>",
      "before": "<current code>",
      "after": "<improved code>"
    }
  ],
  "proposedChanges": [
    // IMPORTANT: Create ONE proposedChange for EACH issue above. If you found 4 issues, create 4 proposedChanges.
    {
      "id": "<unique-id like 'change-1' - should match corresponding issue-1>",
      "title": "<short title - same as the issue title>",
      "description": "<what this single fix does>",
      "category": "<security | performance | bugs | readability | bestPractices>",
      "before": "<original code snippet with the problem>",
      "after": "<fixed code snippet>",
      "diff": "<unified diff format>",
      "lineStart": <starting line>,
      "lineEnd": <ending line>
    }
    // Repeat for EACH issue - do NOT combine multiple fixes into one!
  ],
  "actionItems": [
    {
      "id": "<unique-id like 'action-1'>",
      "priority": "high" | "low",
      "title": "<actionable task starting with verb>",
      "description": "<why this matters>",
      "relatedIssueId": "<id of related issue or null>"
    }
  ]
}

## Critical Rules
1. ALWAYS provide before/after code for every issue and suggestion
2. NEVER be vague—show exactly where and how to fix
3. Use plain English—explain jargon when used
4. Include line numbers when applicable
5. BE REALISTIC—most code scores 60-80, not 95+
6. RETURN ONLY JSON—no markdown, no explanation
7. **ONE FIX PER ISSUE**: Create a SEPARATE proposedChange for EACH issue. If there are 4 issues, there must be 4 proposedChanges. NEVER bundle multiple fixes into one proposedChange.
8. **CATEGORY SCORES**: Security score should reflect security issues found (0-100). If there are SQL injection issues, security should be LOW (e.g., 10-30). If code is secure, security should be HIGH (e.g., 85-100). Same logic for other categories.

## Good Plain English Examples
BAD: "Potential null pointer dereference"
GOOD: "This code tries to use 'user.name' but 'user' might not exist yet. If someone visits before logging in, the app will crash."

BAD: "Consider implementing input sanitization"
GOOD: "User input is being put directly into the database query. An attacker could type special characters to steal all your data."

## CRITICAL: proposedChanges Must Match Issues Count

If you identify 3 issues, you MUST create 3 separate proposedChanges entries. Example:

issues: [
  { "id": "issue-1", "title": "SQL Injection", ... },
  { "id": "issue-2", "title": "Missing Error Handler", ... },
  { "id": "issue-3", "title": "N+1 Query", ... }
]

proposedChanges: [
  { "id": "change-1", "title": "SQL Injection", "before": "...", "after": "..." },
  { "id": "change-2", "title": "Missing Error Handler", "before": "...", "after": "..." },
  { "id": "change-3", "title": "N+1 Query", "before": "...", "after": "..." }
]

WRONG (bundled): proposedChanges: [{ "id": "change-1", "title": "Fix all issues", ... }]
RIGHT (separate): One proposedChange per issue, so users can toggle each fix individually.`;

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

        // Build the user message
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
        let reviewResult;
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
            // Find JSON object
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            reviewResult = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('Failed to parse Claude response:', textContent.text);
            throw new Error('Failed to parse review results');
        }

        // Validate response structure
        if (typeof reviewResult.score !== 'number' || !reviewResult.categories) {
            throw new Error('Invalid response structure from Claude');
        }

        // Ensure arrays exist
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
