import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface FixProgressItem {
    id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'complete';
}

interface FixProgressProps {
    isVisible: boolean;
    items: FixProgressItem[];
    currentStep: string;
}

export function FixProgress({ isVisible, items, currentStep }: FixProgressProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-cyan-500/20 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Applying fixes...</h3>
                                <p className="text-sm text-stone-400">{currentStep}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.status === 'complete' ? 'bg-emerald-500' :
                                            item.status === 'in-progress' ? 'bg-orange-500' :
                                                'bg-stone-700'
                                        }`}>
                                        {item.status === 'complete' ? (
                                            <Check className="w-4 h-4 text-white" />
                                        ) : item.status === 'in-progress' ? (
                                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                        ) : (
                                            <div className="w-2 h-2 bg-stone-500 rounded-full" />
                                        )}
                                    </div>
                                    <span className={`text-sm ${item.status === 'complete' ? 'text-emerald-400' :
                                            item.status === 'in-progress' ? 'text-white' :
                                                'text-stone-500'
                                        }`}>
                                        {item.title}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
