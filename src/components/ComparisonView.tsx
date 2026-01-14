import { motion } from 'framer-motion';
import { Check, X, ArrowRight, TrendingUp, Shield, Zap, Eye, Code, Copy, RotateCcw } from 'lucide-react';
import type { ReviewResponse, Issue } from '@/shared/types';
import { useState } from 'react';

interface ComparisonViewProps {
    previousResult: ReviewResponse;
    currentResult: ReviewResponse;
    fixedIssueIds: string[];
    fixedCode: string;
    onNewReview: () => void;
    onContinueFixing: () => void;
}

export function ComparisonView({
    previousResult,
    currentResult,
    fixedIssueIds,
    fixedCode,
    onNewReview,
    onContinueFixing,
}: ComparisonViewProps) {
    const [showCode, setShowCode] = useState(false);
    const [copied, setCopied] = useState(false);

    const scoreImprovement = currentResult.score - previousResult.score;
    const issuesFixed = fixedIssueIds.length;
    const remainingIssues = currentResult.issues.length;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(fixedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Get the issues that were fixed (from previous result)
    const fixedIssues = previousResult.issues.filter(issue =>
        fixedIssueIds.includes(issue.id)
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Score Comparison Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-2xl border border-emerald-500/20"
            >
                <div className="flex items-center justify-center gap-8 mb-6">
                    {/* Before Score */}
                    <div className="text-center">
                        <p className="text-sm text-stone-400 mb-2">Before</p>
                        <div className="w-24 h-24 rounded-full border-4 border-stone-600 flex items-center justify-center">
                            <span className="text-2xl font-bold text-stone-400">{previousResult.score}</span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center"
                    >
                        <ArrowRight className="w-8 h-8 text-emerald-400" />
                        {scoreImprovement > 0 && (
                            <span className="text-emerald-400 font-bold mt-1">+{scoreImprovement}</span>
                        )}
                    </motion.div>

                    {/* After Score */}
                    <div className="text-center">
                        <p className="text-sm text-emerald-400 mb-2">After</p>
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-500/10"
                        >
                            <span className="text-2xl font-bold text-emerald-400">{currentResult.score}</span>
                        </motion.div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-xl glass">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Check className="w-5 h-5 text-emerald-400" />
                            <span className="text-2xl font-bold text-white">{issuesFixed}</span>
                        </div>
                        <p className="text-sm text-stone-400">Issues Fixed</p>
                    </div>
                    <div className="text-center p-4 rounded-xl glass">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            <span className="text-2xl font-bold text-white">+{scoreImprovement > 0 ? scoreImprovement : 0}</span>
                        </div>
                        <p className="text-sm text-stone-400">Score Boost</p>
                    </div>
                    <div className="text-center p-4 rounded-xl glass">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Shield className="w-5 h-5 text-amber-400" />
                            <span className="text-2xl font-bold text-white">{remainingIssues}</span>
                        </div>
                        <p className="text-sm text-stone-400">Remaining</p>
                    </div>
                </div>

                {/* Message */}
                <div className="text-center">
                    {currentResult.score >= 90 ? (
                        <p className="text-lg text-emerald-400 font-medium">
                            🎉 Excellent! Your code is ready to ship!
                        </p>
                    ) : currentResult.score >= 75 ? (
                        <p className="text-lg text-cyan-400 font-medium">
                            Looking good! A few more fixes and you're golden.
                        </p>
                    ) : (
                        <p className="text-lg text-amber-400 font-medium">
                            Making progress! Keep fixing to improve your score.
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Fixed Issues List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-2xl"
            >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-400" />
                    Issues Fixed ({issuesFixed})
                </h3>

                <div className="space-y-3">
                    {fixedIssues.map((issue, index) => (
                        <motion.div
                            key={issue.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-stone-300 line-through opacity-60">{issue.title}</p>
                                <p className="text-sm text-emerald-400">Fixed ✓</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${issue.severity === 'critical'
                                ? 'bg-red-500/20 text-red-400 line-through'
                                : 'bg-amber-500/20 text-amber-400 line-through'
                                }`}>
                                {issue.severity}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Remaining Issues (if any) */}
            {remainingIssues > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 rounded-2xl"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <X className="w-5 h-5 text-amber-400" />
                        Apply Remaining Fixes? ({remainingIssues} left)
                    </h3>

                    <div className="space-y-3">
                        {currentResult.issues.slice(0, 3).map((issue) => (
                            <div
                                key={issue.id}
                                className="flex items-center gap-4 p-4 rounded-xl glass"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${issue.severity === 'critical' ? 'bg-red-500/20' : 'bg-amber-500/20'
                                    }`}>
                                    <X className={`w-4 h-4 ${issue.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                                        }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-stone-300">{issue.title}</p>
                                    <p className="text-sm text-stone-500 truncate">{issue.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {remainingIssues > 3 && (
                        <p className="text-sm text-stone-500 mt-3 text-center">
                            +{remainingIssues - 3} more issues
                        </p>
                    )}

                    {/* Apply Remaining Fixes Button */}
                    <div className="mt-6 pt-4 border-t border-stone-700/50">
                        <motion.button
                            onClick={onContinueFixing}
                            className="w-full refactor-btn px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 glow-orange"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Zap className="w-5 h-5" />
                            Continue Fixing These Issues
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Fixed Code Preview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 rounded-2xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Code className="w-5 h-5 text-cyan-400" />
                        Fixed Code
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCode(!showCode)}
                            className="px-4 py-2 rounded-lg glass text-stone-400 text-sm font-medium hover:text-white hover:bg-white/10 transition flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            {showCode ? 'Hide' : 'Show'} Code
                        </button>
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${copied
                                ? 'bg-emerald-500 text-white'
                                : 'glass text-stone-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy Code'}
                        </button>
                    </div>
                </div>

                {showCode && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="code-block overflow-hidden"
                    >
                        <div className="code-block-header px-4 py-2 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            <span className="text-xs text-emerald-400 ml-auto">✓ Fixed</span>
                        </div>
                        <pre className="p-4 max-h-64 overflow-auto">
                            <code className="text-sm text-stone-300 font-mono whitespace-pre">
                                {fixedCode}
                            </code>
                        </pre>
                    </motion.div>
                )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-4"
            >
                <button
                    onClick={onNewReview}
                    className="px-6 py-3 rounded-xl glass text-stone-300 font-medium hover:bg-white/10 transition flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Scan Another Code Block
                </button>

                {remainingIssues > 0 && (
                    <motion.button
                        onClick={onContinueFixing}
                        className="refactor-btn px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-2 glow-orange"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Zap className="w-5 h-5" />
                        Fix More Issues
                    </motion.button>
                )}
            </motion.div>
        </motion.div>
    );
}
