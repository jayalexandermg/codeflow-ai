// /src/lib/analyzer.ts

import Anthropic from '@anthropic-ai/sdk';
import { ReviewResponse } from './types';
import { CODE_REVIEW_AGENT_SYSTEM_PROMPT } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeCode(code: string, language?: string): Promise<ReviewResponse> {
  
  const userMessage = `Analyze this${language ? ` ${language}` : ''} code:

\`\`\`${language || ''}
${code}
\`\`\`

Return your analysis as JSON.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: CODE_REVIEW_AGENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage
      }
    ]
  });
  
  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }
  
  // Clean response (remove any markdown if model accidentally adds it)
  let jsonText = content.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  }
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }
  
  // Parse and validate
  const result: ReviewResponse = JSON.parse(jsonText.trim());
  
  // Ensure required fields exist
  if (typeof result.score !== 'number') {
    throw new Error('Invalid response: missing score');
  }
  if (!result.categories) {
    throw new Error('Invalid response: missing categories');
  }
  if (!Array.isArray(result.issues)) {
    result.issues = [];
  }
  if (!Array.isArray(result.suggestions)) {
    result.suggestions = [];
  }
  if (!Array.isArray(result.actionItems)) {
    result.actionItems = [];
  }
  
  return result;
}