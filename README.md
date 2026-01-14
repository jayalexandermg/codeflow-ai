# CodeFlow AI

AI-powered code review that speaks your language. Get plain-English explanations, one-click fixes, and confidence scores — no technical expertise required.

## Features

- 🤖 **Plain English Reviews** - Explanations anyone can understand
- ⚡ **One-Click Fixes** - Apply AI recommendations instantly
- 🔄 **Iterative Refactor** - Apply fixes and re-scan until perfect
- 📊 **Confidence Scores** - Know exactly how good your code is

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Netlify Functions
- **AI**: Anthropic Claude API

## Getting Started

```bash
# Install dependencies (no global installs required)
npm install

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run development server
npm run dev

# Run with Netlify Functions locally
npx netlify dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

## Project Structure

```
codeflow-ai/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route pages
│   ├── shared/         # Shared types and data
│   └── App.tsx         # Main app with routing
├── netlify/
│   └── functions/      # Serverless API endpoints
└── public/             # Static assets
```

## License

MIT
