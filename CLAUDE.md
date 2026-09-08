# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeFlow AI is an AI-powered code review application for developers who build quickly with AI assistance but need validation before shipping. It provides plain-English code reviews with one-click fixes using the Anthropic Claude API.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Netlify Functions (serverless Node.js)
- **AI**: Anthropic Claude API (claude-3-5-sonnet model)
- **CLI**: Standalone Node.js terminal tool

## Commands

```bash
# Install dependencies
npm install

# Development (Vite only, no API)
npm run dev

# Full stack development with Netlify Functions
npx netlify dev

# Production build
npm run build

# Lint
npm run lint

# CLI tool (from cli/ directory)
cd cli && npm install
node index.js <file.js>
```

## Environment Setup

Copy `.env.example` to `.env` and add your `ANTHROPIC_API_KEY`.

## Architecture

### State Flow
1. User inputs code → `ReviewContext` stores code
2. POST to `/api/review` → Claude analyzes code with system prompt
3. Results (score, issues, suggestions, proposedChanges) stored in context
4. User selects fixes → POST to `/api/apply-fix` → string replacements applied
5. Updated code displayed with before/after comparison

### Key Files

| File | Purpose |
|------|---------|
| `src/context/ReviewContext.tsx` | Global state management for entire review workflow |
| `src/lib/prompts.ts` | System prompt defining CodeFlow Agent behavior |
| `src/lib/analyzer.ts` | Client-side Claude API integration |
| `src/lib/types.ts` | TypeScript interfaces for review data |
| `netlify/functions/review.js` | API endpoint for code analysis |
| `netlify/functions/apply-fix.js` | API endpoint for applying fixes |

### Routes

- `/` - Landing page with demo loader
- `/input` - Code input textarea
- `/loading` - Review progress animation
- `/results` - Score display, issues, suggestions, fix workflow

### API Endpoints

- `POST /api/review` - Analyzes code, returns `ReviewResponse`
- `POST /api/apply-fix` - Applies string replacements to code

### ReviewResponse Structure

```typescript
{
  score: number           // 0-100
  summary: string
  categories: { security, performance, readability, bestPractices }
  issues: Issue[]         // Critical/warning items with fix suggestions
  suggestions: Suggestion[]
  proposedChanges: Change[]
  actionItems: ActionItem[]
}
```

## Important Notes

- The system prompt in `src/lib/prompts.ts` is duplicated in `netlify/functions/review.js` and `cli/index.js` - keep them in sync when modifying
- API proxy (`/api/*` → Netlify Functions) only works with `npx netlify dev`, not plain `npm run dev`
- Demo data in `src/shared/demo-data.ts` provides 3 test scenarios for UI development
- Scoring weights: Security & Bugs (critical) > Error Handling (high) > Performance (medium) > Readability (low)
