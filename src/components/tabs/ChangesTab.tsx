import { motion } from 'framer-motion';
import { GitBranch, HelpCircle, Cpu, Info, Check, X, Sliders, ArrowRight, Layers } from 'lucide-react';
import type { Change } from '@/shared/types';

interface ChangesTabProps {
    changes: Change[];
    selectedFixes: Set<string>;
    onToggleFix: (fixId: string) => void;
    onSelectAll: () => void;
    onClearAll: () => void;
    onApplyFixes: () => void;
}

export function ChangesTab({
    changes,
    selectedFixes,
    onToggleFix,
    onSelectAll,
    onClearAll,
    onApplyFixes,
}: ChangesTabProps) {
    const selectedCount = selectedFixes.size;
    const totalCount = changes.length;
    const impactScore = Math.min(selectedCount * 12, 40);

    // Generate diff display from changes
    const generateDiffDisplay = () => {
        if (changes.length === 0) return [];

        // Combine all diffs for display
        const lines: { content: string; type: 'added' | 'removed' | 'unchanged' }[] = [];
        changes.forEach(change => {
            if (change.diff) {
                change.diff.split('\n').forEach(line => {
                    if (line.startsWith('+') && !line.startsWith('+++')) {
                        lines.push({ content: line, type: 'added' });
                    } else if (line.startsWith('-') && !line.startsWith('---')) {
                        lines.push({ content: line, type: 'removed' });
                    } else {
                        lines.push({ content: line, type: 'unchanged' });
                    }
                });
            }
        });
        return lines;
    };

    const diffLines = generateDiffDisplay();

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-2xl"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Proposed Code Changes</h3>
                        <p className="text-sm text-stone-400">AI-generated improvements to apply</p>
                    </div>
                </div>
                <button className="w-9 h-9 rounded-lg glass hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition">
                    <HelpCircle className="w-4 h-4" />
                </button>
            </div>

            {/* Diff Display */}
            <div className="code-block mb-6">
                <div className="code-block-header px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <span className="text-xs text-stone-400">suggested-fixes.js</span>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto font-mono text-sm">
                    {diffLines.map((line, index) => (
                        <div
                            key={index}
                            className={`px-2 py-0.5 code-line ${line.type === 'added' ? 'diff-added' :
                                    line.type === 'removed' ? 'diff-removed' :
                                        'diff-unchanged'
                                }`}
                        >
                            {line.content}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                    <span className="text-sm text-stone-400">Review Issues</span>
                </div>
                <div className="w-12 h-px bg-gradient-to-r from-orange-500/50 to-cyan-500/50" />
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">2</div>
                    <span className="text-sm text-stone-300 font-medium">Select Fixes</span>
                </div>
                <div className="w-12 h-px bg-gradient-to-r from-cyan-500/50 to-orange-500/50" />
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full glass border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm pulse-glow">3</div>
                    <span className="text-sm text-orange-400 font-medium">Refactor</span>
                </div>
            </div>

            {/* Fix Toggles Section */}
            <div className="glass-strong rounded-2xl p-6 border border-orange-500/20 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                        <Sliders className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                            Configure Fixes
                        </h4>
                        <p className="text-sm text-stone-400">Toggle the fixes you want the AI agent to apply</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onSelectAll} className="text-xs text-orange-400 hover:text-orange-300 transition font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Select All
                        </button>
                        <span className="text-stone-600">|</span>
                        <button onClick={onClearAll} className="text-xs text-stone-400 hover:text-white transition font-medium flex items-center gap-1">
                            <X className="w-3 h-3" />
                            Clear
                        </button>
                    </div>
                </div>

                {/* Fix Toggle Items */}
                <div className="space-y-3">
                    {changes.map((change, index) => {
                        const isSelected = selectedFixes.has(change.id);
                        return (
                            <motion.div
                                key={change.id}
                                onClick={() => onToggleFix(change.id)}
                                className={`fix-toggle-item flex items-center gap-4 p-4 rounded-xl glass border cursor-pointer ${isSelected ? 'border-orange-500/30 selected' : 'border-stone-700'
                                    }`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'glass'
                                        }`}>
                                        <span className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-stone-500'}`}>
                                            {index + 1}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-sm font-medium ${isSelected ? 'text-orange-400' : 'text-stone-400'}`}>
                                            {change.title || change.description}
                                        </span>
                                        {isSelected && (
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-400 flex items-center gap-1">
                                                <Check className="w-3 h-3" />
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-stone-500">{change.description}</p>
                                </div>
                                <div className={`toggle ${isSelected ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleFix(change.id); }} />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Selected Count Badge */}
                <div className="mt-4 flex items-center justify-between p-3 rounded-xl glass border border-stone-700">
                    <span className="text-sm text-stone-400 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-orange-400" />
                        <span>{selectedCount}</span> of <span>{totalCount}</span> fixes selected
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full ${selectedCount === 0 ? 'glass text-stone-400' :
                                selectedCount === totalCount ? 'bg-gradient-to-r from-orange-500/20 to-cyan-500/20 text-orange-400 border border-orange-500/30' :
                                    'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}>
                            {selectedCount === 0 ? 'Select fixes to see impact' :
                                selectedCount === totalCount ? '🚀 Maximum boost!' :
                                    `Estimated +${impactScore} confidence boost`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Refactor Button */}
            <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 via-cyan-500/20 to-orange-500/20 blur-xl animate-pulse" />
                <motion.button
                    onClick={onApplyFixes}
                    disabled={selectedCount === 0}
                    className={`refactor-btn relative w-full py-5 rounded-2xl font-bold text-xl text-white transition-all duration-300 flex items-center justify-center gap-4 shadow-2xl ${selectedCount > 0 ? 'glow-orange hover:scale-[1.02] active:scale-[0.98]' : 'opacity-50 cursor-not-allowed'
                        }`}
                    whileHover={selectedCount > 0 ? { scale: 1.02 } : {}}
                    whileTap={selectedCount > 0 ? { scale: 0.98 } : {}}
                >
                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <div className="text-lg font-bold">Initiate & Refactor</div>
                            <div className="text-sm font-normal text-white/70">Apply selected AI-generated fixes</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ml-4">
                            <ArrowRight className="w-5 h-5 animate-bounce-x" />
                        </div>
                    </div>
                </motion.button>
            </div>

            {/* Info Card */}
            <div className="mt-4 p-4 rounded-xl glass border border-cyan-500/20 bg-cyan-500/5">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                        <h5 className="font-medium text-cyan-300 mb-1">How Refactoring Works</h5>
                        <p className="text-sm text-stone-400 leading-relaxed">
                            The AI agent will apply your selected fixes to the code, creating a safer and more efficient version.
                            After refactoring, you can run a new review to see the improvements.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
