// /src/lib/types.ts

export interface ReviewRequest {
  code: string;
  language?: string;
  filename?: string;
}

export interface ReviewResponse {
  score: number;
  summary: string;
  categories: {
    security: number;
    performance: number;
    readability: number;
    bestPractices: number;
  };
  issues: Issue[];
  suggestions: Suggestion[];
  actionItems: ActionItem[];
}

export interface Issue {
  id: string;
  severity: 'critical' | 'warning';
  category: 'security' | 'bugs' | 'errorHandling' | 'performance' | 'readability';
  line: number | null;
  title: string;
  description: string;
  fix: {
    description: string;
    before: string;
    after: string;
  };
}

export interface Suggestion {
  id: string;
  category: 'performance' | 'readability' | 'bestPractices';
  title: string;
  description: string;
  before: string;
  after: string;
}

export interface ActionItem {
  id: string;
  priority: 'high' | 'low';
  title: string;
  relatedIssueId: string | null;
}

export interface ApplyFixRequest {
  code: string;
  fixes: Array<{
    before: string;
    after: string;
  }>;
}

export interface ApplyFixResponse {
  fixedCode: string;
  appliedCount: number;
}