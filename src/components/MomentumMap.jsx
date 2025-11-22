import React, { useState } from 'react';
import ActionCard from './ActionCard';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const TABS = [
    { id: 'immediate', label: 'Immediate Actions', sub: 'This Week' },
    { id: 'medium', label: 'Stabilization', sub: '' },
    { id: 'long', label: 'Systems', sub: '' },
];

const MomentumMap = ({ actions, completedActions, onToggle, onReroll, isRerolling, onDeepDive, onToggleSubAction }) => {
    const [activeTab, setActiveTab] = useState('immediate');

    const filteredActions = actions.filter(a => a.horizon === activeTab);

    return (
        <div>
            <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 py-4 text-sm font-medium border-b-2 transition-colors min-w-[120px]",
                            activeTab === tab.id
                                ? "border-white text-white"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <div className="font-bold">{tab.label}</div>
                        <div className="text-xs font-normal opacity-60">{tab.sub}</div>
                    </button>
                ))}
            </div>

            <div className="space-y-4 min-h-[400px]">
                <AnimatePresence mode='popLayout'>
                    {filteredActions.map((action) => (
                        <ActionCard
                            key={action.id}
                            action={action}
                            isCompleted={completedActions.includes(action.id)}
                            onToggle={onToggle}
                            onReroll={onReroll}
                            isRerolling={isRerolling}
                            onDeepDive={onDeepDive}
                            onToggleSubAction={onToggleSubAction}
                        />
                    ))}
                </AnimatePresence>

                {filteredActions.length === 0 && (
                    <div className="text-center text-zinc-500 py-10">
                        No actions found for this horizon.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MomentumMap;
