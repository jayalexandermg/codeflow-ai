import { motion } from 'framer-motion';
import { Bug, HelpCircle, Wand2 } from 'lucide-react';
import type { Issue } from '@/shared/types';

interface IssuesTabProps {
    issues: Issue[];
    onApplyFix?: (issueId: string) => void;
}

export function IssuesTab({ issues, onApplyFix }: IssuesTabProps) {
    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical':
                return { border: 'border-red-500/20', bg: 'bg-red-500/20', text: 'text-red-400', icon: 'red' };
            case 'warning':
                return { border: 'border-amber-500/20', bg: 'bg-amber-500/20', text: 'text-amber-400', icon: 'amber' };
            default:
                return { border: 'border-cyan-500/20', bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: 'cyan' };
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
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <Bug className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Issues Found</h3>
                        <p className="text-sm text-stone-400">Problems that need attention</p>
                    </div>
                </div>
                <button className="w-9 h-9 rounded-lg glass hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition">
                    <HelpCircle className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                {issues.map((issue, index) => {
                    const styles = getSeverityStyles(issue.severity);
                    return (
                        <motion.div
                            key={issue.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`issue-card p-4 rounded-xl glass border ${styles.border} ${issue.severity}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-lg ${styles.bg} flex items-center justify-center flex-shrink-0`}>
                                    <Bug className={`w-4 h-4 ${styles.text}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles.bg} ${styles.text} capitalize`}>
                                            {issue.severity}
                                        </span>
                                        <span className="text-xs text-stone-500">Line {issue.line}</span>
                                    </div>
                                    <h4 className="font-medium text-white mb-1">{issue.title}</h4>
                                    <p className="text-sm text-stone-400">{issue.description}</p>
                                </div>
                                {/* Apply Fix Button - NEW */}
                                {onApplyFix && (
                                    <motion.button
                                        onClick={() => onApplyFix(issue.id)}
                                        className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-medium hover:bg-orange-500/30 transition flex items-center gap-1.5"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Wand2 className="w-3 h-3" />
                                        Apply Fix
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
