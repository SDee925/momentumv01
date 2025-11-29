import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const InputSection = ({ onGenerate, isLoading, onNavigateToFriction }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            if (onNavigateToFriction) {
                onNavigateToFriction(input);
            } else {
                onGenerate(input);
            }
        }
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl w-full"
            >
                <div className="mb-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Step 1 of 2
                </div>

                <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400">
                    <Sparkles size={12} className="text-yellow-500" />
                    <span>The Momentum Engine v1.0</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                    Momentum Starts Here.
                </h1>

                <p className="text-xl text-zinc-400 mb-12 max-w-lg mx-auto">
                    Tell me the goal, project, or area where you're stuck. I'll map the Block Pattern and build your first 3-step protocol.
                </p>

                <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., Write a chapter, start fitness, email outreach…"
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-5 text-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-white text-black rounded-xl flex items-center justify-center hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <ArrowRight size={24} />
                        )}
                    </button>
                </form>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 text-zinc-500 text-sm font-mono"
                    >
                        Analyzing friction points...
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default InputSection;
