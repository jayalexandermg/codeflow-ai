import { motion } from 'framer-motion';
import { Lightbulb, HelpCircle, ArrowRight } from 'lucide-react';
import type { Suggestion } from '@/shared/types';

interface SuggestionsTabProps {
    suggestions: Suggestion[];
}

export function SuggestionsTab({ suggestions }: SuggestionsTabProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-2xl"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">AI Suggestions</h3>
                        <p className="text-sm text-stone-400">Recommendations to improve your code</p>
                    </div>
                </div>
                <button className="w-9 h-9 rounded-lg glass hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition">
                    <HelpCircle className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                    <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="issue-card p-4 rounded-xl glass border border-stone-700"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-white mb-2">{suggestion.title}</h4>
                                <p className="text-sm text-stone-400 mb-3">{suggestion.description}</p>
                                <div className="p-3 rounded-lg bg-stone-800/50 border border-stone-700 text-xs text-stone-300 font-mono flex items-center gap-2">
                                    <ArrowRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                                    <code>{suggestion.codeSnippet}</code>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
