import { motion } from 'framer-motion';
import { Check, RotateCw, Plus, Sparkles, Copy } from 'lucide-react';

interface RefactorSuccessProps {
    fixesApplied: number;
    confidenceBoost: number;
    remainingIssues: number;
    fixedCode: string;
    onRerunReview: () => void;
    onNewReview: () => void;
}

export function RefactorSuccess({
    fixesApplied,
    confidenceBoost,
    remainingIssues,
    fixedCode,
    onRerunReview,
    onNewReview,
}: RefactorSuccessProps) {
    const handleCopyCode = () => {
        navigator.clipboard.writeText(fixedCode);
        // Could add a toast notification here
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-8 border border-emerald-500/20 relative overflow-hidden"
        >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-emerald-500/5 animate-pulse" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <motion.div
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                        >
                            <Check className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 opacity-30 blur-lg animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/30 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Fixes Applied
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">Code Refactoring Complete!</h3>
                        <p className="text-stone-400">
                            Your code has been updated with the AI-generated fixes. Run a new review to verify the improvements.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                    {/* Copy Fixed Code Button - NEW */}
                    <motion.button
                        onClick={handleCopyCode}
                        className="px-6 py-3 rounded-xl glass border border-emerald-500/30 text-emerald-400 font-medium transition flex items-center gap-2 hover:bg-emerald-500/10"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Copy className="w-4 h-4" />
                        Copy Fixed Code
                    </motion.button>

                    {/* Re-run Review Button - NEW */}
                    <motion.button
                        onClick={onRerunReview}
                        className="refactor-btn px-8 py-4 rounded-xl font-bold text-lg text-white transition flex items-center gap-3 glow-emerald relative overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="absolute inset-0 rounded-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer" />
                        </div>
                        <div className="relative flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                                <RotateCw className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold">Re-run Review</div>
                                <div className="text-xs font-normal text-white/70">Verify improvements</div>
                            </div>
                        </div>
                    </motion.button>

                    <button
                        onClick={onNewReview}
                        className="text-sm text-stone-400 hover:text-white transition font-medium flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Scan Another Code Block
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="relative flex items-center justify-center gap-8 mt-6 pt-6 border-t border-stone-700/50">
                <div className="text-center">
                    <motion.div
                        className="text-2xl font-bold text-emerald-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {fixesApplied}
                    </motion.div>
                    <div className="text-xs text-stone-500">Fixes Applied</div>
                </div>
                <div className="w-px h-8 bg-stone-700" />
                <div className="text-center">
                    <motion.div
                        className="text-2xl font-bold text-cyan-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        +{confidenceBoost}
                    </motion.div>
                    <div className="text-xs text-stone-500">Est. Confidence Boost</div>
                </div>
                <div className="w-px h-8 bg-stone-700" />
                <div className="text-center">
                    <motion.div
                        className="text-2xl font-bold text-orange-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {remainingIssues}
                    </motion.div>
                    <div className="text-xs text-stone-500">Issues Remaining</div>
                </div>
            </div>
        </motion.div>
    );
}
