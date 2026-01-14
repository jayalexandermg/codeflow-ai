import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, HelpCircle, Wand2, Check } from 'lucide-react';
import type { ActionItem } from '@/shared/types';

interface ActionsTabProps {
    actionItems: ActionItem[];
    onApplyFix?: (actionId: string) => void;
}

export function ActionsTab({ actionItems, onApplyFix }: ActionsTabProps) {
    const [completed, setCompleted] = useState<Set<string>>(new Set());

    const toggleCompleted = (id: string) => {
        setCompleted(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
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
                <button className="w-9 h-9 rounded-lg glass hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition">
                    <HelpCircle className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                {actionItems.map((item, index) => {
                    const isCompleted = completed.has(item.id);
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-4 p-4 rounded-xl glass action-item ${isCompleted ? 'opacity-60' : ''}`}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => toggleCompleted(item.id)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition ${isCompleted
                                        ? 'bg-orange-500 border-orange-500'
                                        : 'border-stone-600 hover:border-orange-500'
                                    }`}
                            >
                                {isCompleted && <Check className="w-3 h-3 text-white" />}
                            </button>

                            <div className="flex-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getPriorityStyles(item.priority)}`}>
                                    {item.priority} priority
                                </span>
                                <p className={`text-stone-300 mt-2 ${isCompleted ? 'line-through' : ''}`}>
                                    {item.title}
                                </p>
                                {item.description && (
                                    <p className="text-sm text-stone-500 mt-1">{item.description}</p>
                                )}
                            </div>

                            {/* Apply Fix Button - NEW */}
                            {onApplyFix && !isCompleted && (
                                <motion.button
                                    onClick={() => {
                                        onApplyFix(item.id);
                                        toggleCompleted(item.id);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-medium hover:bg-orange-500/30 transition flex items-center gap-1.5"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Wand2 className="w-3 h-3" />
                                    Apply Fix
                                </motion.button>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
