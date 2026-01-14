// ============================================
// CodeFlow AI - Shared TypeScript Types
// ============================================

// Request sent to the review API
export interface ReviewRequest {
    code: string;
    language?: string; // auto-detect if not provided
    filename?: string;
}

// Response from the review API - aligned with Claude output
export interface ReviewResponse {
    score: number; // 0-100 overall confidence score
    summary?: string; // one sentence assessment
    categories: CategoryScores;
    issues: Issue[];
    suggestions: Suggestion[];
    proposedChanges: Change[]; // Derived from issues.fix
    actionItems: ActionItem[];
}

export interface CategoryScores {
    security: number;      // 0-100
    performance: number;   // 0-100
    readability: number;   // 0-100
    bestPractices: number; // 0-100
}

export interface Issue {
    id: string;
    severity: 'critical' | 'warning';
    category?: 'security' | 'bugs' | 'errorHandling' | 'performance' | 'readability';
    line: number | null;
    title: string;
    description: string; // plain English explanation
    fix?: {
        description: string;
        before: string;
        after: string;
    };
}

export interface Suggestion {
    id: string;
    category?: 'performance' | 'readability' | 'bestPractices';
    title: string;
    description: string; // plain English explanation
    codeSnippet?: string; // the suggested improvement (for display)
    before?: string;
    after?: string;
}

export interface Change {
    id: string;
    title: string;
    description: string;
    diff?: string;        // unified diff format for display
    fixedCode?: string;   // the complete fixed code
    before?: string;      // original code snippet
    after?: string;       // fixed code snippet
    lineStart?: number;
    lineEnd?: number;
}

export interface ActionItem {
    id: string;
    priority: 'high' | 'low';
    title: string;
    description?: string;
    relatedIssueId?: string | null;
    relatedSuggestionId?: string;
    relatedChangeId?: string;
}

// Request to apply fixes
export interface ApplyFixRequest {
    code: string;
    fixIds?: string[];  // IDs of changes/action items to apply
    fixes?: Array<{
        before: string;
        after: string;
    }>;
}

// Response after applying fixes
export interface ApplyFixResponse {
    fixedCode: string;
    appliedFixes?: string[];
    appliedCount?: number;
    remainingIssues?: number;
}

// UI State types
export type TabType = 'issues' | 'suggestions' | 'changes' | 'actions';

export interface ReviewState {
    status: 'idle' | 'loading' | 'success' | 'error';
    code: string;
    result: ReviewResponse | null;
    error: string | null;
    selectedFixes: string[];
}
