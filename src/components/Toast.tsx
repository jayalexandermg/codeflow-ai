import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface ToastProps {
    isVisible: boolean;
    message: string;
    type?: 'success' | 'info' | 'error';
    subMessage?: string;
}

export function Toast({ isVisible, message, type = 'success', subMessage }: ToastProps) {
    const colors = {
        success: 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/30',
        info: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
        error: 'from-red-500/20 to-orange-500/20 border-red-500/30',
    };

    const iconColors = {
        success: 'text-emerald-400',
        info: 'text-cyan-400',
        error: 'text-red-400',
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    className={`fixed top-24 left-1/2 z-50 px-6 py-4 rounded-2xl glass border bg-gradient-to-r ${colors[type]}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ${iconColors[type]}`}>
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-white">{message}</p>
                            {subMessage && <p className="text-sm text-stone-400">{subMessage}</p>}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
