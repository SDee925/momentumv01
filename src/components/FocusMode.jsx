import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, X } from 'lucide-react';
import clsx from 'clsx';

const FocusMode = ({ task, onComplete, onExit, onToggleSubAction, lastHistorySync }) => {
    const Motion = motion;
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isActive, setIsActive] = useState(false);
    const hasSubActions = task?.subActions?.length > 0;
    const completedSubActions = task?.subActions?.filter(sub => sub.isCompleted)?.length || 0;

    useEffect(() => {
        if (!isActive) return;
        const id = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    // stop at zero and deactivate (schedule to avoid sync setState in interval)
                    setTimeout(() => setIsActive(false), 0);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [isActive]);

    // Reset timer when a different task is opened; schedule to avoid synchronous setState warning
    useEffect(() => {
        const t = setTimeout(() => {
            setIsActive(false);
            setTimeLeft(25 * 60);
        }, 0);
        return () => clearTimeout(t);
    }, [task?.id]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(25 * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggleSubAction = (subActionId) => {
        if (typeof onToggleSubAction === 'function') {
            onToggleSubAction(task.id, subActionId);
        }
    };

    return (
        <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6"
        >
            {/* Background Pulse */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={clsx(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] transition-all duration-1000",
                    isActive ? "bg-indigo-900/20 animate-pulse" : "bg-zinc-900/20"
                )} />
            </div>

            <div className="relative z-10 max-w-3xl w-full text-center">
                <div className="mb-12">
                    <span className="inline-block px-3 py-1 rounded-full bg-zinc-900 text-zinc-500 text-xs font-mono tracking-widest mb-6 border border-zinc-800">
                        THE TUNNEL
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        {task.title}
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        {task.description}
                    </p>
                </div>
                {typeof lastHistorySync !== 'undefined' && (
                    <div className="absolute top-6 right-6 text-sm text-zinc-400">
                        {lastHistorySync ? `Last archive: ${new Date(lastHistorySync).toLocaleString()}` : 'No archives saved'}
                    </div>
                )}

                {/* Timer */}
                <div className="mb-16 relative">
                    <div className="text-[120px] font-bold font-mono text-white leading-none tracking-tighter tabular-nums">
                        {formatTime(timeLeft)}
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-8">
                        <button
                            onClick={toggleTimer}
                            className={clsx(
                                "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                                isActive
                                    ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                    : "bg-white text-black hover:scale-105"
                            )}
                        >
                            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white flex items-center justify-center transition-colors"
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </div>

                {hasSubActions && (
                    <div className="mb-12 text-left bg-zinc-950/70 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Deep Dive Steps</p>
                                <h2 className="text-2xl font-semibold text-white">Micro-moves to build momentum</h2>
                            </div>
                            <span className="text-sm font-mono text-zinc-400">
                                {completedSubActions}/{task.subActions.length} completed
                            </span>
                        </div>
                        <div className="space-y-3">
                            {task.subActions.map((sub) => (
                                <button
                                    key={sub.id}
                                    onClick={() => handleToggleSubAction(sub.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all text-left",
                                        sub.isCompleted
                                            ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                                            : "border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:border-zinc-700"
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            "shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold",
                                            sub.isCompleted
                                                ? "bg-emerald-500 border-emerald-500 text-black"
                                                : "border-zinc-500 text-zinc-500"
                                        )}
                                    >
                                        {sub.isCompleted ? '✓' : ''}
                                    </span>
                                    <div className="flex-1">
                                        <p className={clsx(
                                            "text-base",
                                            sub.isCompleted && "line-through text-emerald-200/70"
                                        )}>
                                            {sub.title}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onComplete}
                        className="w-full md:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-105"
                    >
                        <CheckCircle size={24} />
                        Complete Task
                    </button>
                    <button
                        onClick={onExit}
                        className="w-full md:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium rounded-xl flex items-center justify-center gap-3 transition-colors border border-zinc-800"
                    >
                        <X size={24} />
                        Exit Tunnel
                    </button>
                </div>
            </div>
        </Motion.div>
    );
};

export default FocusMode;
