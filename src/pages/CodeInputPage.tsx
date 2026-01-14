import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, FileCode, HelpCircle, Loader2 } from 'lucide-react';
import { useReview } from '@/context/ReviewContext';
import { Toast } from '@/components/Toast';

export function CodeInputPage() {
    const navigate = useNavigate();
    const { runReview, setCode, state } = useReview();
    const [localCode, setLocalCode] = useState(state.code || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Watch for errors
    useEffect(() => {
        if (state.status === 'error' && state.error) {
            setShowError(true);
            setErrorMessage(state.error);
            setIsSubmitting(false);
            // Auto-hide after 5 seconds
            const timer = setTimeout(() => setShowError(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [state.status, state.error]);

    const handleRunReview = async () => {
        if (!localCode.trim()) {
            setShowError(true);
            setErrorMessage('Please enter some code to review');
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        setIsSubmitting(true);
        setCode(localCode);
        navigate('/loading');

        // Start review - LoadingPage will handle navigation based on state
        runReview(localCode);
    };

    const placeholder = `// Paste or type your code here...

// Example:
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

    return (
        <>
            <Toast
                isVisible={showError}
                message="Error"
                subMessage={errorMessage}
                type="error"
            />

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="max-w-7xl mx-auto px-6 py-8"
            >
                <div className="glass-card p-6 rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                                <FileCode className="w-5 h-5 text-stone-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Your Code</h2>
                                <p className="text-sm text-stone-400">Paste or type the code you want reviewed</p>
                            </div>
                        </div>
                        <button
                            className="w-10 h-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition"
                            title="What should I paste?"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Code Editor */}
                    <div className="code-block">
                        <div className="code-block-header px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            </div>
                            <span className="text-xs text-stone-400">
                                {localCode.split('\n').length} lines
                            </span>
                        </div>
                        <textarea
                            value={localCode}
                            onChange={(e) => setLocalCode(e.target.value)}
                            className="w-full h-72 bg-transparent text-stone-300 p-4 font-mono text-sm focus:outline-none resize-none"
                            placeholder={placeholder}
                            spellCheck={false}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={() => navigate('/')}
                            className="text-stone-400 hover:text-white transition font-medium flex items-center gap-2"
                            disabled={isSubmitting}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <motion.button
                            onClick={handleRunReview}
                            className="refactor-btn px-6 py-3 rounded-xl font-semibold text-white transition flex items-center gap-2 glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Bot className="w-5 h-5" />
                                    Run AI Review
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
