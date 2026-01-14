import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorDisplayProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    onGoHome?: () => void;
}

export function ErrorDisplay({
    title = 'Something went wrong',
    message,
    onRetry,
    onGoHome
}: ErrorDisplayProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 rounded-2xl border border-red-500/20 max-w-md mx-auto text-center"
        >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-400" />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-stone-400 mb-6">{message}</p>

            <div className="flex items-center justify-center gap-3">
                {onGoHome && (
                    <button
                        onClick={onGoHome}
                        className="px-5 py-2.5 rounded-xl glass text-stone-300 font-medium hover:bg-white/10 transition flex items-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </button>
                )}
                {onRetry && (
                    <motion.button
                        onClick={onRetry}
                        className="refactor-btn px-6 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 glow-orange"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}
