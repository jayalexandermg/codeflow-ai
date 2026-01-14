import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Shield } from 'lucide-react';
import { useReview } from '@/context/ReviewContext';

const processingSteps = [
    'Checking security patterns...',
    'Analyzing performance...',
    'Evaluating readability...',
    'Comparing with best practices...',
    'Generating suggestions...',
    'Finalizing review...',
];

export function LoadingPage() {
    const navigate = useNavigate();
    const { state } = useReview();
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => {
                if (prev < processingSteps.length - 1) return prev + 1;
                return prev;
            });
        }, 400);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (state.status === 'success') {
            navigate('/results');
        } else if (state.status === 'error') {
            navigate('/input');
        }
    }, [state.status, navigate]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6 py-8"
        >
            <div className="glass-card p-16 rounded-3xl text-center">
                {/* Animated Robot Icon */}
                <motion.div
                    className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 to-cyan-500/20 flex items-center justify-center mb-8 relative"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-cyan-500 opacity-20"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                    >
                        <Bot className="w-10 h-10 text-orange-400" />
                    </motion.div>
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-4">Agent is Analyzing...</h2>
                <p className="text-stone-400 mb-8">
                    Reviewing your code for issues, improvements, and best practices
                </p>

                {/* Processing Dots */}
                <div className="flex gap-2 justify-center mb-4">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-cyan-500"
                            animate={{
                                scale: [0.6, 1, 0.6],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>

                {/* Current Step */}
                <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                    <Shield className="w-4 h-4" />
                    <motion.span
                        key={stepIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {processingSteps[stepIndex]}
                    </motion.span>
                </div>
            </div>
        </motion.div>
    );
}
