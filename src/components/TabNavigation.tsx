import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, GitBranch, ListChecks } from 'lucide-react';
import type { TabType } from '@/shared/types';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    counts: {
        issues: number;
        suggestions: number;
        actions: number;
    };
}

export function TabNavigation({ activeTab, onTabChange, counts }: TabNavigationProps) {
    const tabs = [
        { id: 'issues' as TabType, label: 'Issues', icon: AlertTriangle, count: counts.issues, countColor: 'bg-orange-500/20 text-orange-400' },
        { id: 'suggestions' as TabType, label: 'Suggestions', icon: Lightbulb, count: counts.suggestions, countColor: 'bg-cyan-500/20 text-cyan-400' },
        { id: 'changes' as TabType, label: 'Proposed Changes', icon: GitBranch, count: null, countColor: '' },
        { id: 'actions' as TabType, label: 'Action Items', icon: ListChecks, count: counts.actions, countColor: 'bg-emerald-500/20 text-emerald-400' },
    ];

    return (
        <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map((tab) => (
                <motion.button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`tab-btn flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${tab.countColor}`}>
                            {tab.count}
                        </span>
                    )}
                </motion.button>
            ))}
        </div>
    );
}
