import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Download, ArrowRight, Sparkles } from 'lucide-react';

interface FixedCodeOutputProps {
    score: number;
    fixedCode: string;
    onReviewDifferentCode: () => void;
    onRerunReview: () => void;
}

export function FixedCodeOutput({
    score,
    fixedCode,
    onReviewDifferentCode,
    onRerunReview,
}: FixedCodeOutputProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(fixedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([fixedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fixed-code.js';
        a.click();
        URL.revokeObjectURL(url);
    };

    const getScoreMessage = () => {
        if (score >= 90) return { text: 'Ready to ship!', color: 'text-emerald-400' };
        if (score >= 75) return { text: 'Looking great!', color: 'text-cyan-400' };
        if (score >= 60) return { text: 'Getting better', color: 'text-amber-400' };
        return { text: 'Keep improving', color: 'text-orange-400' };
    };

    const scoreMessage = getScoreMessage();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 border border-emerald-500/20"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <motion.div
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                    >
                        <Check className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 opacity-30 blur-lg" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Review Complete
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                        Score: {score} <span className={scoreMessage.color}>({scoreMessage.text})</span>
                    </h3>
                </div>
            </div>

            {/* Code Block */}
            <div className="code-block mb-6">
                <div className="code-block-header px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Fixed code
                    </span>
                </div>
                <pre className="p-4 max-h-80 overflow-auto">
                    <code className="text-sm text-stone-300 font-mono whitespace-pre">
                        {fixedCode}
                    </code>
                </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
                <motion.button
                    onClick={handleCopy}
                    className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition ${copied
                            ? 'bg-emerald-500 text-white'
                            : 'glass border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy Code
                        </>
                    )}
                </motion.button>

                <motion.button
                    onClick={handleDownload}
                    className="px-5 py-2.5 rounded-xl glass border border-cyan-500/30 text-cyan-400 font-medium hover:bg-cyan-500/10 transition flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Download className="w-4 h-4" />
                    Download File
                </motion.button>

                <div className="flex-1" />

                <button
                    onClick={onReviewDifferentCode}
                    className="px-5 py-2.5 rounded-xl glass text-stone-400 font-medium hover:text-white hover:bg-white/10 transition flex items-center gap-2"
                >
                    Review Different Code
                </button>

                <motion.button
                    onClick={onRerunReview}
                    className="refactor-btn px-5 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 glow-orange"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Re-scan Code
                    <ArrowRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}
