import { useState, useEffect } from 'react';
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
import { FixConfirmationModal } from '@/components/FixConfirmationModal';
import { Toast } from '@/components/Toast';
import { FixProgress } from '@/components/FixProgress';
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

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isApplyingFixes, setIsApplyingFixes] = useState(false);

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

    // Progress state
    const [showProgress, setShowProgress] = useState(false);
    const [progressItems, setProgressItems] = useState<Array<{ id: string; title: string; status: 'pending' | 'in-progress' | 'complete' }>>([]);

    // Redirect if no results
    useEffect(() => {
        if (state.status !== 'success' || !state.result) {
            navigate('/');
        }
    }, [state.status, state.result, navigate]);

    if (state.status !== 'success' || !state.result) {
        return null;
    }

    const { result } = state;

    // Get diff lines for modal
    const getDiffLines = () => {
        const lines: Array<{ content: string; type: 'added' | 'removed' | 'unchanged' }> = [];

        // Get selected issues with fixes
        result.issues
            .filter(issue => selectedFixes.has(issue.id) && issue.fix)
            .forEach(issue => {
                if (issue.fix) {
                    issue.fix.before.split('\n').forEach(line => {
                        lines.push({ content: line, type: 'removed' });
                    });
                    issue.fix.after.split('\n').forEach(line => {
                        lines.push({ content: line, type: 'added' });
                    });
                }
            });

        return lines.length > 0 ? lines : [
            { content: '// Selected fixes will be applied', type: 'unchanged' as const }
        ];
    };

    const handleApplyFixes = () => {
        if (selectedFixes.size === 0) {
            setToastMessage('Please select at least one fix to apply');
            setToastType('error');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmApplyFixes = async () => {
        setShowConfirmModal(false);
        setIsApplyingFixes(true);

        // Setup progress items
        const items = Array.from(selectedFixes).map((id, index) => ({
            id,
            title: `Applying fix ${index + 1}`,
            status: 'pending' as const,
        }));
        items.push({ id: 'rescan', title: 'Re-scanning code', status: 'pending' as const });
        setProgressItems(items);
        setShowProgress(true);

        // Simulate progress
        for (let i = 0; i < items.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 300));
            setProgressItems(prev => prev.map((item, idx) => ({
                ...item,
                status: idx < i ? 'complete' : idx === i ? 'in-progress' : 'pending'
            })));
        }

        const count = selectedFixes.size;
        await applyFixes();

        // Mark all complete
        setProgressItems(prev => prev.map(item => ({ ...item, status: 'complete' as const })));

        await new Promise(resolve => setTimeout(resolve, 500));
        setShowProgress(false);
        setIsApplyingFixes(false);

        setAppliedFixCount(count);
        setShowRefactorSuccess(true);

        // Show success toast
        setToastMessage(`${count} fix${count > 1 ? 'es' : ''} applied successfully`);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleRerunReview = async () => {
        setShowRefactorSuccess(false);
        setToastMessage('Re-scanning code...');
        setToastType('info');
        setShowToast(true);

        navigate('/loading');
        await runReview(fixedCode);
        navigate('/results');
    };

    const handleNewReview = () => {
        navigate('/input');
    };

    const handleApplySingleFix = (fixId: string) => {
        if (!selectedFixes.has(fixId)) {
            toggleFix(fixId);
        }
        // Show toast
        setToastMessage('Fix selected. Go to Changes tab to apply.');
        setToastType('info');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleViewDiff = (actionId: string) => {
        // Switch to changes tab
        setActiveTab('changes');
        // Could also scroll to the specific fix
    };

    return (
        <>
            {/* Toast Notification */}
            <Toast
                isVisible={showToast}
                message={toastMessage}
                type={toastType}
            />

            {/* Fix Confirmation Modal */}
            <FixConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmApplyFixes}
                title={`Apply ${selectedFixes.size} fix${selectedFixes.size > 1 ? 'es' : ''}`}
                diffLines={getDiffLines()}
                isLoading={isApplyingFixes}
            />

            {/* Fix Progress Overlay */}
            <FixProgress
                isVisible={showProgress}
                items={progressItems}
                currentStep="Applying selected fixes..."
            />

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
                            onViewDiff={handleViewDiff}
                            onApplySelectedFixes={(ids) => {
                                ids.forEach(id => {
                                    if (!selectedFixes.has(id)) toggleFix(id);
                                });
                                handleApplyFixes();
                            }}
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
                            remainingIssues={Math.max(0, result.issues.length - appliedFixCount)}
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
        </>
    );
}
