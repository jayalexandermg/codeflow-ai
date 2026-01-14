// ============================================
// CodeFlow AI - Shared TypeScript Types
// ============================================

// Request sent to the review API
export interface ReviewRequest {
    code: string;
    language?: string; // auto-detect if not provided
    filename?: string;
}

// Response from the review API
export interface ReviewResponse {
    score: number; // 0-100 overall confidence score
    categories: CategoryScores;
    issues: Issue[];
    suggestions: Suggestion[];
    proposedChanges: Change[];
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
    line: number;
    title: string;
    description: string; // plain English explanation
}

export interface Suggestion {
    id: string;
    title: string;
    description: string; // plain English explanation
    codeSnippet: string; // the suggested improvement
}

export interface Change {
    id: string;
    title: string;
    description: string;
    diff: string;        // unified diff format for display
    fixedCode: string;   // the complete fixed code
    lineStart: number;
    lineEnd: number;
}

export interface ActionItem {
    id: string;
    priority: 'high' | 'low';
    title: string;
    description: string;
    relatedIssueId?: string;
    relatedSuggestionId?: string;
    relatedChangeId?: string;
}

// Request to apply fixes
export interface ApplyFixRequest {
    code: string;
    fixIds: string[];  // IDs of changes/action items to apply
}

// Response after applying fixes
export interface ApplyFixResponse {
    fixedCode: string;
    appliedFixes: string[];
    remainingIssues: number;
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
