import { createContext, useContext, useState, ReactNode } from 'react';
import type { ReviewResponse, ReviewState } from '@/shared/types';
import { DEMO_CODE, DEMO_RESULT } from '@/shared/demo-data';

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
                // Simulate API delay for demo
                await new Promise(resolve => setTimeout(resolve, 2500));
                setState(prev => ({ ...prev, status: 'success', result: DEMO_RESULT }));
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

    const applyFixes = () => {
        if (!state.result || selectedFixes.size === 0) return;

        // For now, just update fixedCode based on selected fixes
        // In production, this would call /api/apply-fix
        let newCode = originalCode;

        // Apply fixes logic here (simplified for demo)
        state.result.proposedChanges
            .filter(change => selectedFixes.has(change.id))
            .forEach(change => {
                newCode = change.fixedCode || newCode;
            });

        setFixedCode(newCode);
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
        setState(prev => ({ ...prev, code: DEMO_CODE }));
        runReview(DEMO_CODE, true);
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
