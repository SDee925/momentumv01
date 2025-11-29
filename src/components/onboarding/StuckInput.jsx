import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../../context/OnboardingContext';

export const StuckInput = () => {
  const { stuckInput, setStuckInput, nextStep } = useOnboarding();
  const [localInput, setLocalInput] = useState(stuckInput);

  const handleContinue = () => {
    setStuckInput(localInput);
    nextStep();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 md:p-12 shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Let's get you moving again.
              </h1>
              <p className="text-lg text-slate-400">
                What are you trying to make progress on?
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />

              <button
                onClick={handleContinue}
                disabled={!localInput.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/20 disabled:shadow-none"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
