# CodeFlow CLI

AI-powered code review from your terminal.

## Installation

```bash
# From the cli directory
npm install

# Link globally (optional)
npm link
```

## Usage

```bash
# Review a file
codeflow src/app.js

# Review piped input
cat utils.py | codeflow

# Review clipboard (macOS)
pbpaste | codeflow

# Review clipboard (Windows PowerShell)
Get-Clipboard | codeflow
```

## Environment Variables

```bash
export ANTHROPIC_API_KEY="your-key-here"
```

## Output

The CLI provides:
- Overall score (0-100)
- Category breakdown (Security, Performance, Readability, Best Practices)
- Issues with severity and line numbers
- Suggested fixes with before/after code
- Action items prioritized by importance

## Exit Codes

- `0` - Score >= 60 (acceptable)
- `1` - Score < 60 or error (needs work)

Use in CI/CD:
```bash
codeflow src/main.js || echo "Code review failed"
```
