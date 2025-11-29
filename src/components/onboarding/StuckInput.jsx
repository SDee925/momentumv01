import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../../context/OnboardingContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const StuckInput = () => {
  const { stuckInput, setStuckInput, nextStep } = useOnboarding();
  const [localInput, setLocalInput] = useState(stuckInput);

  const handleContinue = () => {
    setStuckInput(localInput);
    nextStep();
  };

  return (
    <div className="min-h-screen bg-[#242424] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center"
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

        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="e.g., Write a chapter, start fitness, email outreach…"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-5 text-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all"
          />
          <button
            onClick={handleContinue}
            disabled={!localInput.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-white text-black rounded-xl flex items-center justify-center hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
