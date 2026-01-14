import { createContext, useContext, useState, ReactNode } from 'react';
import type { ReviewResponse, ReviewState } from '@/shared/types';
import { getRandomDemo } from '@/shared/demo-data';

interface ReviewContextType {
    state: ReviewState;
    originalCode: string;
    fixedCode: string;
    selectedFixes: Set<string>;
    setCode: (code: string) => void;
    runReview: (code: string, isDemo?: boolean) => Promise<void>;
    applyFixes: () => void;
    toggleFix: (fixId: string) => void;
    selectAllFixes: () => void;
    clearAllFixes: () => void;
    resetToWelcome: () => void;
    loadDemo: () => void;
}

const ReviewContext = createContext<ReviewContextType | null>(null);

export function useReview() {
    const context = useContext(ReviewContext);
    if (!context) {
        throw new Error('useReview must be used within ReviewProvider');
    }
    return context;
}

interface ReviewProviderProps {
    children: ReactNode;
}

export function ReviewProvider({ children }: ReviewProviderProps) {
    const [state, setState] = useState<ReviewState>({
        status: 'idle',
        code: '',
        result: null,
        error: null,
        selectedFixes: [],
    });
    const [originalCode, setOriginalCode] = useState('');
    const [fixedCode, setFixedCode] = useState('');
    const [selectedFixes, setSelectedFixes] = useState<Set<string>>(new Set());

    const setCode = (code: string) => {
        setState(prev => ({ ...prev, code }));
    };

    const runReview = async (code: string, isDemo = false) => {
        setOriginalCode(code);
        setFixedCode(code);
        setSelectedFixes(new Set());
        setState(prev => ({ ...prev, status: 'loading', code, error: null }));

        try {
            if (isDemo) {
                // Simulate API delay for demo - use stored demo result
                await new Promise(resolve => setTimeout(resolve, 2500));
                // The demo result should already be set by loadDemo
                // Just mark as success with existing result if we have one
                if (state.result) {
                    setState(prev => ({ ...prev, status: 'success' }));
                } else {
                    const demo = getRandomDemo();
                    setState(prev => ({ ...prev, status: 'success', result: demo.result }));
                }
                return;
            }

            // Call actual API
            const response = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                throw new Error('Review failed');
            }

            const result: ReviewResponse = await response.json();
            setState(prev => ({ ...prev, status: 'success', result }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            }));
        }
    };

    const toggleFix = (fixId: string) => {
        setSelectedFixes(prev => {
            const next = new Set(prev);
            if (next.has(fixId)) {
                next.delete(fixId);
            } else {
                next.add(fixId);
            }
            return next;
        });
    };

    const selectAllFixes = () => {
        if (state.result) {
            const allIds = state.result.proposedChanges.map(c => c.id);
            setSelectedFixes(new Set(allIds));
        }
    };

    const clearAllFixes = () => {
        setSelectedFixes(new Set());
    };

    const applyFixes = async () => {
        if (!state.result || selectedFixes.size === 0) return;

        // Collect the fixes to apply
        const fixesToApply: Array<{ before: string; after: string }> = [];

        // Gather before/after from issues
        state.result.issues
            .filter(issue => selectedFixes.has(issue.id) && issue.fix)
            .forEach(issue => {
                if (issue.fix) {
                    fixesToApply.push({
                        before: issue.fix.before,
                        after: issue.fix.after,
                    });
                }
            });

        // Gather before/after from suggestions
        state.result.suggestions
            .filter(suggestion => selectedFixes.has(suggestion.id) && suggestion.before && suggestion.after)
            .forEach(suggestion => {
                if (suggestion.before && suggestion.after) {
                    fixesToApply.push({
                        before: suggestion.before,
                        after: suggestion.after,
                    });
                }
            });

        // Gather before/after from proposed changes
        state.result.proposedChanges
            .filter(change => selectedFixes.has(change.id) && change.before && change.after)
            .forEach(change => {
                if (change.before && change.after) {
                    fixesToApply.push({
                        before: change.before,
                        after: change.after,
                    });
                }
            });

        if (fixesToApply.length === 0) {
            // Fallback: just use the fixedCode from first selected change
            const firstChange = state.result.proposedChanges.find(c => selectedFixes.has(c.id));
            if (firstChange?.fixedCode) {
                setFixedCode(firstChange.fixedCode);
            }
            setSelectedFixes(new Set());
            return;
        }

        try {
            const response = await fetch('/api/apply-fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: originalCode, fixes: fixesToApply }),
            });

            if (!response.ok) {
                throw new Error('Failed to apply fixes');
            }

            const result = await response.json();
            setFixedCode(result.fixedCode);
        } catch (error) {
            // Fallback to simple string replacement
            let newCode = originalCode;
            fixesToApply.forEach(fix => {
                newCode = newCode.replace(fix.before, fix.after);
            });
            setFixedCode(newCode);
        }

        setSelectedFixes(new Set());
    };

    const resetToWelcome = () => {
        setState({
            status: 'idle',
            code: '',
            result: null,
            error: null,
            selectedFixes: [],
        });
        setOriginalCode('');
        setFixedCode('');
        setSelectedFixes(new Set());
    };

    const loadDemo = () => {
        const demo = getRandomDemo();
        setState(prev => ({ ...prev, code: demo.code, result: demo.result }));
        setOriginalCode(demo.code);
        setFixedCode(demo.code);
        runReview(demo.code, true);
    };

    return (
        <ReviewContext.Provider
            value={{
                state,
                originalCode,
                fixedCode,
                selectedFixes,
                setCode,
                runReview,
                applyFixes,
                toggleFix,
                selectAllFixes,
                clearAllFixes,
                resetToWelcome,
                loadDemo,
            }}
        >
            {children}
        </ReviewContext.Provider>
    );
}
