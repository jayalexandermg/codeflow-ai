import { motion, AnimatePresence } from 'framer-motion';
import { X, GitBranch, ArrowRight } from 'lucide-react';

interface DiffLine {
    content: string;
    type: 'added' | 'removed' | 'unchanged';
}

interface FixConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    diffLines: DiffLine[];
    isLoading?: boolean;
}

export function FixConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    diffLines,
    isLoading = false,
}: FixConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                                <GitBranch className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Apply Fix</h3>
                                <p className="text-sm text-stone-400">{title}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-lg glass hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Diff Preview */}
                    <div className="flex-1 overflow-hidden mb-6">
                        <p className="text-sm text-stone-400 mb-3">This will make the following changes:</p>
                        <div className="code-block overflow-hidden">
                            <div className="code-block-header px-4 py-2 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            </div>
                            <div className="p-4 max-h-64 overflow-y-auto font-mono text-sm">
                                {diffLines.map((line, index) => (
                                    <div
                                        key={index}
                                        className={`px-2 py-0.5 ${line.type === 'added' ? 'diff-added' :
                                                line.type === 'removed' ? 'diff-removed' :
                                                    'diff-unchanged'
                                            }`}
                                    >
                                        {line.type === 'added' && <span className="text-emerald-500 mr-2">+</span>}
                                        {line.type === 'removed' && <span className="text-red-500 mr-2">-</span>}
                                        {line.type === 'unchanged' && <span className="text-stone-600 mr-2"> </span>}
                                        {line.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl glass hover:bg-white/10 text-stone-300 font-medium transition"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <motion.button
                            onClick={onConfirm}
                            className="refactor-btn px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 glow-orange"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Applying...
                                </>
                            ) : (
                                <>
                                    Apply & Re-scan
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
