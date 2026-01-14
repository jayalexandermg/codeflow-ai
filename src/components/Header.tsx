import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Home, Bot } from 'lucide-react';

interface HeaderProps {
    onOpenHelp?: () => void;
}

export function Header({ onOpenHelp }: HeaderProps) {
    const navigate = useNavigate();

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-strong sticky top-0 z-50"
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="agent-avatar">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold gradient-text">CodeFlow AI</h1>
                            <p className="text-xs text-stone-400 flex items-center gap-2">
                                <span className="status-dot bg-emerald-500" />
                                Agent Ready • Intelligent Code Review
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onOpenHelp}
                            className="w-10 h-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition"
                            title="Learn about CodeFlow AI"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-5 py-2.5 rounded-xl glass hover:bg-white/10 text-stone-300 hover:text-white transition font-medium flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Home
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
