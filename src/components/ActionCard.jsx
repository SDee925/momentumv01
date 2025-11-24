import React from 'react';
import { Check, RefreshCw, ArrowRight, Split, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const ActionCard = ({ action, isCompleted, onToggle, onReroll, isRerolling, onDeepDive, onToggleSubAction, onEnterTunnel, syncStatus = 'idle' }) => {
    const hasSubActions = action.subActions && action.subActions.length > 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={clsx(
                "relative p-6 rounded-xl border transition-all duration-300 group",
                isCompleted
                    ? "bg-emerald-900/10 border-emerald-500/20"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
            )}
        >
            {/* per-action sync indicator */}
            <div className="absolute top-3 right-3">
                {syncStatus === 'saving' && (
                    <div className="flex items-center gap-1 text-sm text-zinc-400">
                        <RefreshCw size={14} className="animate-spin" />
                    </div>
                )}
                {syncStatus === 'synced' && (
                    <div className="flex items-center gap-1 text-sm text-emerald-400">
                        <Check size={14} />
                    </div>
                )}
                {syncStatus === 'error' && (
                    <div className="flex items-center gap-1 text-sm text-red-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </div>
                )}
            </div>
            <div className="flex items-start gap-4">
                <button
                    onClick={() => onToggle(action.id)}
                    className={clsx(
                        "mt-1 shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
                        isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-zinc-600 hover:border-zinc-400"
                    )}
                >
                    {isCompleted && <Check size={18} strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0">
                    <h3 className={clsx(
                        "text-xl font-semibold mb-2 transition-all",
                        isCompleted ? "text-emerald-400 line-through" : "text-white"
                    )}>
                        {action.title}
                    </h3>
                    <p className={clsx(
                        "text-base mb-4 leading-relaxed",
                        isCompleted ? "text-zinc-500" : "text-zinc-300"
                    )}>
                        {action.description}
                    </p>

                    {!isCompleted && (
                        <div className="text-sm text-zinc-500 font-mono bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 mb-4">
                            <span className="text-zinc-400 font-bold">WHY:</span> {action.rationale}
                        </div>
                    )}

                    {hasSubActions && (
                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-zinc-800">
                            {action.subActions.map(sub => (
                                <div key={sub.id} className="flex items-center gap-3">
                                    <button
                                        onClick={() => onToggleSubAction(action.id, sub.id)}
                                        className={clsx(
                                            "w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0",
                                            sub.isCompleted
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : "border-zinc-600 hover:border-zinc-400"
                                        )}
                                    >
                                        {sub.isCompleted && <Check size={12} strokeWidth={3} />}
                                    </button>
                                    <span className={clsx(
                                        "text-sm transition-colors",
                                        sub.isCompleted ? "text-zinc-500 line-through" : "text-zinc-300"
                                    )}>
                                        {sub.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!isCompleted && (
                    <div className="flex flex-col gap-2 ml-2">
                        <button
                            onClick={() => onEnterTunnel(action.id)}
                            disabled={isRerolling}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-emerald-900/30 text-zinc-400 hover:text-emerald-400 rounded-lg transition-all border border-transparent hover:border-emerald-500/30 w-full justify-center whitespace-nowrap"
                            title="Enter The Tunnel: Focus Mode"
                        >
                            <Maximize2 size={18} />
                            <span className="text-sm font-medium">Focus</span>
                        </button>
                        <button
                            onClick={() => onDeepDive(action.id, action.title)}
                            disabled={isRerolling}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-indigo-900/30 text-zinc-400 hover:text-indigo-400 rounded-lg transition-all border border-transparent hover:border-indigo-500/30 w-full justify-center whitespace-nowrap"
                            title="Deep Dive: Break this down"
                        >
                            <Split size={18} className={clsx(isRerolling && "animate-pulse")} />
                            <span className="text-sm font-medium">Deep Dive</span>
                        </button>
                        <button
                            onClick={() => onReroll(action.id, action.title)}
                            disabled={isRerolling}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all border border-transparent hover:border-zinc-600 w-full justify-center whitespace-nowrap"
                            title="Reroll this task"
                        >
                            <RefreshCw size={18} className={clsx(isRerolling && "animate-spin")} />
                            <span className="text-sm font-medium">Reroll</span>
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ActionCard;
