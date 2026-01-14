import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useReview } from '@/context/ReviewContext';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { TabNavigation } from '@/components/TabNavigation';
import { IssuesTab } from '@/components/tabs/IssuesTab';
import { SuggestionsTab } from '@/components/tabs/SuggestionsTab';
import { ChangesTab } from '@/components/tabs/ChangesTab';
import { ActionsTab } from '@/components/tabs/ActionsTab';
import { RefactorSuccess } from '@/components/RefactorSuccess';
import type { TabType } from '@/shared/types';

export function ResultsPage() {
    const navigate = useNavigate();
    const {
        state,
        originalCode,
        fixedCode,
        selectedFixes,
        toggleFix,
        selectAllFixes,
        clearAllFixes,
        applyFixes,
        runReview,
    } = useReview();

    const [activeTab, setActiveTab] = useState<TabType>('issues');
    const [showRefactorSuccess, setShowRefactorSuccess] = useState(false);
    const [appliedFixCount, setAppliedFixCount] = useState(0);

    // Redirect if no results
    if (state.status !== 'success' || !state.result) {
        navigate('/');
        return null;
    }

    const { result } = state;

    const handleApplyFixes = () => {
        const count = selectedFixes.size;
        applyFixes();
        setAppliedFixCount(count);
        setShowRefactorSuccess(true);
    };

    const handleRerunReview = async () => {
        setShowRefactorSuccess(false);
        navigate('/loading');
        await runReview(fixedCode);
        navigate('/results');
    };

    const handleNewReview = () => {
        navigate('/input');
    };

    const handleApplySingleFix = (fixId: string) => {
        // Toggle on and immediately apply
        if (!selectedFixes.has(fixId)) {
            toggleFix(fixId);
        }
        // For single fix, we'd apply immediately
        // This is a simplified version - full implementation would call API
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6 py-8"
        >
            {/* Score Display */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <ScoreDisplay
                    score={result.score}
                    categories={result.categories}
                />
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <TabNavigation
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    counts={{
                        issues: result.issues.length,
                        suggestions: result.suggestions.length,
                        actions: result.actionItems.length,
                    }}
                />
            </motion.div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'issues' && (
                    <IssuesTab
                        issues={result.issues}
                        onApplyFix={handleApplySingleFix}
                    />
                )}
                {activeTab === 'suggestions' && (
                    <SuggestionsTab suggestions={result.suggestions} />
                )}
                {activeTab === 'changes' && (
                    <ChangesTab
                        changes={result.proposedChanges}
                        selectedFixes={selectedFixes}
                        onToggleFix={toggleFix}
                        onSelectAll={selectAllFixes}
                        onClearAll={clearAllFixes}
                        onApplyFixes={handleApplyFixes}
                    />
                )}
                {activeTab === 'actions' && (
                    <ActionsTab
                        actionItems={result.actionItems}
                        onApplyFix={handleApplySingleFix}
                    />
                )}
            </motion.div>

            {/* Refactor Success Section */}
            {showRefactorSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                >
                    <RefactorSuccess
                        fixesApplied={appliedFixCount}
                        confidenceBoost={appliedFixCount * 12}
                        remainingIssues={result.issues.length - appliedFixCount}
                        fixedCode={fixedCode}
                        onRerunReview={handleRerunReview}
                        onNewReview={handleNewReview}
                    />
                </motion.div>
            )}

            {/* New Review Button */}
            {!showRefactorSuccess && (
                <div className="mt-6 text-center">
                    <motion.button
                        onClick={handleNewReview}
                        className="px-8 py-3 rounded-xl glass hover:bg-white/10 text-stone-300 hover:text-white transition font-medium flex items-center gap-2 mx-auto border border-white/10"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus className="w-4 h-4" />
                        Review Different Code
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
}
