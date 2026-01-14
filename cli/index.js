#!/usr/bin/env node
// CodeFlow AI - CLI Tool
// Usage: npx codeflow <file> or cat file.js | npx codeflow

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
};

// System prompt (same as web version)
const SYSTEM_PROMPT = `You are CodeFlow, an expert code review agent designed for vibe coders—developers who build fast with AI assistance but need help validating their code before shipping.

## Your Identity
You are a senior engineer with 15+ years experience. You explain issues so non-developers understand.
You focus on issues that actually matter, not pedantic style nitpicks. Every issue comes with a concrete fix.

## Analysis Framework
Evaluate code across: SECURITY, BUGS & RELIABILITY, ERROR HANDLING, PERFORMANCE, READABILITY

## Scoring Rules
- Start at 100, deduct based on findings
- Critical security: -25 each, Critical bug: -20 each
- Warning: -5 to -10 each, Readability: -2 to -5 each
- CATEGORY SCORES: If SQL injection found, security score should be LOW (10-30). If code is secure, security should be HIGH (85-100). Same for other categories.

## Output Format
Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "summary": "<one sentence assessment>",
  "categories": { "security": <0-100>, "performance": <0-100>, "readability": <0-100>, "bestPractices": <0-100> },
  "issues": [{ "id": "issue-1", "severity": "critical|warning", "line": <num>, "title": "<title>", "description": "<plain English>", "fix": { "before": "<code>", "after": "<code>" } }],
  "suggestions": [{ "id": "suggestion-1", "title": "<title>", "description": "<explanation>", "before": "<code>", "after": "<code>" }],
  "actionItems": [{ "id": "action-1", "priority": "high|low", "title": "<task>" }]
}`;

function printHeader() {
    console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║                                                             ║
║   ${colors.bold}CodeFlow AI${colors.reset}${colors.cyan} - Intelligent Code Review                    ║
║   ${colors.dim}AI-powered code analysis for vibe coders${colors.reset}${colors.cyan}                 ║
║                                                             ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
`);
}

function printScore(score) {
    let color = colors.green;
    let status = '✓ Ship it!';

    if (score < 60) {
        color = colors.red;
        status = '✗ Do not ship';
    } else if (score < 75) {
        color = colors.yellow;
        status = '⚠ Needs work';
    } else if (score < 90) {
        color = colors.cyan;
        status = '○ Good, fix warnings';
    }

    console.log(`
${colors.bold}Overall Score: ${color}${score}/100${colors.reset} ${colors.dim}${status}${colors.reset}
`);
}

function printCategories(categories) {
    console.log(`${colors.bold}Category Breakdown:${colors.reset}`);

    const bar = (score) => {
        const filled = Math.round(score / 5);
        const empty = 20 - filled;
        let color = colors.green;
        if (score < 60) color = colors.red;
        else if (score < 75) color = colors.yellow;
        else if (score < 90) color = colors.cyan;
        return `${color}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset} ${score}`;
    };

    console.log(`  Security:       ${bar(categories.security)}`);
    console.log(`  Performance:    ${bar(categories.performance)}`);
    console.log(`  Readability:    ${bar(categories.readability)}`);
    console.log(`  Best Practices: ${bar(categories.bestPractices)}`);
    console.log();
}

function printIssues(issues) {
    if (issues.length === 0) {
        console.log(`${colors.green}✓ No issues found!${colors.reset}\n`);
        return;
    }

    console.log(`${colors.bold}Issues Found (${issues.length}):${colors.reset}\n`);

    issues.forEach((issue, i) => {
        const icon = issue.severity === 'critical' ? `${colors.red}●${colors.reset}` : `${colors.yellow}○${colors.reset}`;
        const severityColor = issue.severity === 'critical' ? colors.red : colors.yellow;

        console.log(`${icon} ${colors.bold}${issue.title}${colors.reset}`);
        console.log(`  ${colors.dim}Line ${issue.line || '?'} | ${severityColor}${issue.severity.toUpperCase()}${colors.reset}`);
        console.log(`  ${issue.description}`);

        if (issue.fix) {
            console.log(`  ${colors.dim}Fix:${colors.reset}`);
            console.log(`    ${colors.red}- ${issue.fix.before.split('\n').join('\n    - ')}${colors.reset}`);
            console.log(`    ${colors.green}+ ${issue.fix.after.split('\n').join('\n    + ')}${colors.reset}`);
        }
        console.log();
    });
}

function printSuggestions(suggestions) {
    if (suggestions.length === 0) return;

    console.log(`${colors.bold}Suggestions (${suggestions.length}):${colors.reset}\n`);

    suggestions.forEach((sug) => {
        console.log(`${colors.cyan}💡${colors.reset} ${colors.bold}${sug.title}${colors.reset}`);
        console.log(`   ${sug.description}`);
        if (sug.before && sug.after) {
            console.log(`   ${colors.dim}Before:${colors.reset} ${sug.before.substring(0, 50)}...`);
            console.log(`   ${colors.dim}After:${colors.reset}  ${sug.after.substring(0, 50)}...`);
        }
        console.log();
    });
}

function printActionItems(actionItems) {
    if (actionItems.length === 0) return;

    console.log(`${colors.bold}Action Items:${colors.reset}\n`);

    actionItems.forEach((item) => {
        const icon = item.priority === 'high' ? `${colors.red}!${colors.reset}` : `${colors.dim}○${colors.reset}`;
        console.log(`  ${icon} ${item.title}`);
    });
    console.log();
}

async function analyzeCode(code, filename) {
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIndex = 0;

    const spinnerInterval = setInterval(() => {
        process.stdout.write(`\r${colors.cyan}${spinner[spinnerIndex]}${colors.reset} Analyzing code...`);
        spinnerIndex = (spinnerIndex + 1) % spinner.length;
    }, 80);

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8192,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: `Review this code${filename ? ` (${filename})` : ''}:\n\n\`\`\`\n${code}\n\`\`\``,
                },
            ],
        });

        clearInterval(spinnerInterval);
        process.stdout.write('\r                              \r');

        const textContent = response.content.find((block) => block.type === 'text');
        if (!textContent?.text) {
            throw new Error('No response from Claude');
        }

        // Parse JSON
        let jsonText = textContent.text.trim();
        if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7);
        if (jsonText.startsWith('```')) jsonText = jsonText.slice(3);
        if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);

        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        clearInterval(spinnerInterval);
        process.stdout.write('\r                              \r');
        throw error;
    }
}

async function readStdin() {
    return new Promise((resolve) => {
        let data = '';
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false,
        });
        rl.on('line', (line) => {
            data += line + '\n';
        });
        rl.on('close', () => {
            resolve(data);
        });
    });
}

async function main() {
    printHeader();

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error(`${colors.red}Error: ANTHROPIC_API_KEY environment variable is required.${colors.reset}`);
        console.log(`\nSet it with: ${colors.cyan}export ANTHROPIC_API_KEY="your-key"${colors.reset}`);
        process.exit(1);
    }

    let code = '';
    let filename = '';

    // Check if file argument provided
    const args = process.argv.slice(2);

    if (args.length > 0 && args[0] !== '-') {
        // Read from file
        const filePath = args[0];
        if (!fs.existsSync(filePath)) {
            console.error(`${colors.red}Error: File not found: ${filePath}${colors.reset}`);
            process.exit(1);
        }
        code = fs.readFileSync(filePath, 'utf-8');
        filename = path.basename(filePath);
        console.log(`${colors.dim}Reviewing: ${filename}${colors.reset}\n`);
    } else if (!process.stdin.isTTY) {
        // Read from stdin (piped input)
        code = await readStdin();
        console.log(`${colors.dim}Reviewing piped input...${colors.reset}\n`);
    } else {
        // No input provided
        console.log(`${colors.bold}Usage:${colors.reset}`);
        console.log(`  ${colors.cyan}codeflow <file>${colors.reset}        Review a file`);
        console.log(`  ${colors.cyan}cat file | codeflow${colors.reset}   Review piped input`);
        console.log();
        console.log(`${colors.bold}Examples:${colors.reset}`);
        console.log(`  ${colors.dim}codeflow src/app.js${colors.reset}`);
        console.log(`  ${colors.dim}cat utils.py | codeflow${colors.reset}`);
        console.log(`  ${colors.dim}pbpaste | codeflow${colors.reset}     (review clipboard on macOS)`);
        process.exit(0);
    }

    if (!code.trim()) {
        console.error(`${colors.red}Error: No code to review${colors.reset}`);
        process.exit(1);
    }

    try {
        const result = await analyzeCode(code, filename);

        // Print results
        console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);

        if (result.summary) {
            console.log(`${colors.bold}Summary:${colors.reset} ${result.summary}\n`);
        }

        printScore(result.score);
        printCategories(result.categories);
        printIssues(result.issues || []);
        printSuggestions(result.suggestions || []);
        printActionItems(result.actionItems || []);

        console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
        console.log(`${colors.dim}Powered by CodeFlow AI • claude-sonnet-4-20250514${colors.reset}\n`);

        // Exit with error code if score is too low
        if (result.score < 60) {
            process.exit(1);
        }
    } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

main();
