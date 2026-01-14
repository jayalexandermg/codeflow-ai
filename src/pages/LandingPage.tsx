import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flask, Code, Languages, Wand2, RefreshCw, Cpu } from 'lucide-react';
import { useReview } from '@/context/ReviewContext';

export function LandingPage() {
    const navigate = useNavigate();
    const { loadDemo } = useReview();

    const handleDemo = () => {
        loadDemo();
        navigate('/loading');
    };

    const handleStartOwn = () => {
        navigate('/input');
    };

    const features = [
        {
            icon: Languages,
            title: 'Plain English',
            description: 'Reviews explained in language anyone can understand',
            gradient: 'from-orange-500/20 to-orange-600/20',
            iconColor: 'text-orange-400',
        },
        {
            icon: Wand2,
            title: 'One-Click Fixes',
            description: 'Apply AI recommendations with a single click',
            gradient: 'from-cyan-500/20 to-cyan-600/20',
            iconColor: 'text-cyan-400',
        },
        {
            icon: RefreshCw,
            title: 'Iterative Refactor',
            description: 'Apply fixes and rerun review until perfect',
            gradient: 'from-emerald-500/20 to-emerald-600/20',
            iconColor: 'text-emerald-400',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-6 py-8"
        >
            <div className="glass-card p-12 text-center rounded-3xl">
                <div className="mb-8">
                    {/* Animated Icon */}
                    <motion.div
                        className="w-28 h-28 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 to-cyan-500/20 flex items-center justify-center mb-6 relative"
                        whileHover={{ scale: 1.05 }}
                    >
                        <motion.div
                            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-cyan-500 opacity-20"
                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <Cpu className="w-12 h-12 gradient-text" />
                    </motion.div>

                    <h2 className="text-4xl font-bold mb-4">
                        Intelligent Code Review <span className="gradient-text">Agent</span>
                    </h2>
                    <p className="text-stone-400 text-lg max-w-2xl mx-auto mb-8">
                        Advanced AI-powered code analysis that speaks your language. Get plain-English
                        explanations, one-click fixes, and confidence scores — no technical expertise required.
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex justify-center gap-4 mb-12">
                    <motion.button
                        onClick={handleDemo}
                        className="refactor-btn px-8 py-4 rounded-xl font-semibold text-lg text-white transition flex items-center gap-3 glow-orange"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Flask className="w-5 h-5" />
                        Try Demo Review
                    </motion.button>
                    <motion.button
                        onClick={handleStartOwn}
                        className="px-8 py-4 rounded-xl font-semibold text-lg glass hover:bg-white/10 text-white transition flex items-center gap-3 border border-white/10"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Code className="w-5 h-5" />
                        Start Your Own
                    </motion.button>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="glass p-5 rounded-2xl text-left hover:border-white/15 transition-colors"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                                <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                            </div>
                            <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-stone-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
