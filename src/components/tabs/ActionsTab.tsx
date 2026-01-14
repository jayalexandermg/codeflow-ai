import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, HelpCircle, Wand2, Check, Eye, X, Layers } from 'lucide-react';
import type { ActionItem } from '@/shared/types';

interface ActionsTabProps {
    actionItems: ActionItem[];
    onApplyFix?: (actionId: string) => void;
    onViewDiff?: (actionId: string) => void;
    onApplySelectedFixes?: (actionIds: string[]) => void;
}

export function ActionsTab({
    actionItems,
    onApplyFix,
    onViewDiff,
    onApplySelectedFixes
}: ActionsTabProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [completed, setCompleted] = useState<Set<string>>(new Set());

    const toggleSelected = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSkip = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        setCompleted(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const handleApplyFix = (id: string) => {
        if (onApplyFix) {
            onApplyFix(id);
        }
        setCompleted(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
        setSelected(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const handleApplySelected = () => {
        if (onApplySelectedFixes) {
            onApplySelectedFixes(Array.from(selected));
        }
        setCompleted(prev => {
            const next = new Set([...prev, ...selected]);
            return next;
        });
        setSelected(new Set());
    };

    const clearSelection = () => {
        setSelected(new Set());
    };

    const selectAll = () => {
        const allIds = actionItems.filter(item => !completed.has(item.id)).map(item => item.id);
        setSelected(new Set(allIds));
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-500/20 text-red-400';
            case 'medium':
                return 'bg-amber-500/20 text-amber-400';
            default:
                return 'bg-emerald-500/20 text-emerald-400';
        }
    };

    const selectedCount = selected.size;
    const remainingItems = actionItems.filter(item => !completed.has(item.id));

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-2xl"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Action Items</h3>
                        <p className="text-sm text-stone-400">Steps to complete before merging</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={selectAll}
                        className="text-xs text-orange-400 hover:text-orange-300 transition font-medium"
                    >
                        Select All
                    </button>
                    <span className="text-stone-600">|</span>
                    <button className="w-9 h-9 rounded-lg glass hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition">
                        <HelpCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                {actionItems.map((item, index) => {
                    const isCompleted = completed.has(item.id);
                    const isSelected = selected.has(item.id);

                    if (isCompleted) {
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0.5, y: 0 }}
                                className="flex items-center gap-4 p-4 rounded-xl glass opacity-50"
                            >
                                <div className="w-5 h-5 rounded border bg-emerald-500 border-emerald-500 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-stone-500 line-through flex-1">{item.title}</span>
                                <span className="text-xs text-emerald-400">Completed</span>
                            </motion.div>
                        );
                    }

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl glass action-item border transition-colors ${isSelected ? 'border-orange-500/30 bg-orange-500/5' : 'border-transparent'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleSelected(item.id)}
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition mt-0.5 ${isSelected
                                            ? 'bg-orange-500 border-orange-500'
                                            : 'border-stone-600 hover:border-orange-500'
                                        }`}
                                >
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </button>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getPriorityStyles(item.priority)}`}>
                                            {item.priority} priority
                                        </span>
                                    </div>
                                    <p className="text-stone-300">{item.title}</p>
                                    {item.description && (
                                        <p className="text-sm text-stone-500 mt-1">{item.description}</p>
                                    )}

                                    {/* Action Buttons Row */}
                                    <div className="flex items-center gap-2 mt-4">
                                        <motion.button
                                            onClick={() => handleApplyFix(item.id)}
                                            className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-medium hover:bg-orange-500/30 transition flex items-center gap-1.5"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Wand2 className="w-3 h-3" />
                                            Apply Fix
                                        </motion.button>
                                        {onViewDiff && (
                                            <button
                                                onClick={() => onViewDiff(item.id)}
                                                className="px-3 py-1.5 rounded-lg glass text-stone-400 text-xs font-medium hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
                                            >
                                                <Eye className="w-3 h-3" />
                                                View Diff
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleSkip(item.id)}
                                            className="px-3 py-1.5 rounded-lg glass text-stone-500 text-xs font-medium hover:text-stone-300 hover:bg-white/5 transition flex items-center gap-1.5"
                                        >
                                            <X className="w-3 h-3" />
                                            Skip
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Batch Apply Footer - Only shows when items selected */}
            {selectedCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky bottom-0 p-4 rounded-xl glass-strong border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-cyan-500/10"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <Layers className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {selectedCount} of {remainingItems.length} items selected
                                </p>
                                <p className="text-xs text-stone-400">
                                    Apply all selected fixes at once
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={clearSelection}
                                className="px-4 py-2 rounded-lg glass text-stone-400 text-sm font-medium hover:text-white hover:bg-white/10 transition"
                            >
                                Clear Selection
                            </button>
                            <motion.button
                                onClick={handleApplySelected}
                                className="refactor-btn px-5 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 glow-orange"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Wand2 className="w-4 h-4" />
                                Apply Selected Fixes
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
