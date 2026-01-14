import { motion } from 'framer-motion';

interface ScoreDisplayProps {
    score: number;
    categories: {
        security: number;
        performance: number;
        readability: number;
        bestPractices: number;
    };
}

export function ScoreDisplay({ score, categories }: ScoreDisplayProps) {
    const circumference = 2 * Math.PI * 70; // radius = 70
    const offset = circumference - (score / 100) * circumference;

    const getStatusBadge = () => {
        if (score >= 80) {
            return {
                text: 'Looks Good',
                classes: 'border-emerald-500/30 text-emerald-400',
                dotColor: 'bg-emerald-400',
            };
        } else if (score >= 60) {
            return {
                text: 'Needs Review',
                classes: 'border-amber-500/30 text-amber-400',
                dotColor: 'bg-amber-400',
            };
        }
        return {
            text: 'Needs Work',
            classes: 'border-red-500/30 text-red-400',
            dotColor: 'bg-red-400',
        };
    };

    const status = getStatusBadge();

    const metrics = [
        { label: 'Security', value: categories.security, icon: 'shield-halved', color: 'emerald' },
        { label: 'Performance', value: categories.performance, icon: 'bolt', color: 'amber' },
        { label: 'Readability', value: categories.readability, icon: 'eye', color: 'cyan' },
        { label: 'Best Practices', value: categories.bestPractices, icon: 'check-double', color: 'orange' },
    ];

    return (
        <div className="glass-card p-6 rounded-2xl mb-6">
            <div className="flex flex-col lg:flex-row items-start justify-between mb-6 gap-6">
                <div className="flex items-center gap-6">
                    {/* Confidence Ring */}
                    <div className="confidence-ring">
                        <svg width="160" height="160">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#f97316" />
                                    <stop offset="50%" stopColor="#fb923c" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                            <circle className="bg" cx="80" cy="80" r="70" />
                            <motion.circle
                                className="progress"
                                cx="80"
                                cy="80"
                                r="70"
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <motion.span
                                className="text-4xl font-bold text-white"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {score}
                            </motion.span>
                            <span className="text-xs text-stone-500">confidence</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium glass border ${status.classes} flex items-center gap-2`}>
                                <span className={`w-2 h-2 rounded-full ${status.dotColor} animate-pulse`} />
                                {status.text}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">AI Analysis Complete</h2>
                        <p className="text-stone-400 text-sm">Based on security, performance, readability & best practices</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-stone-400 hover:text-white transition font-medium text-sm flex items-center gap-2">
                        <i className="fas fa-chart-simple" />
                        Scoring Guide
                    </button>
                    <button className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-stone-400 hover:text-white transition font-medium text-sm flex items-center gap-2">
                        <i className="fas fa-code" />
                        Original Code
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        className="glass p-4 rounded-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-stone-400">{metric.label}</span>
                            <i className={`fas fa-${metric.icon} text-${metric.color}-400`} />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 metric-bar">
                                <motion.div
                                    className={`metric-bar-fill bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-400`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metric.value}%` }}
                                    transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                                />
                            </div>
                            <span className="text-xl font-bold text-white">{metric.value}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
