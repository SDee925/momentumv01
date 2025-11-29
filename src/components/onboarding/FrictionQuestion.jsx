import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../../context/OnboardingContext';
import { ArrowRight, Sparkles } from 'lucide-react';

const FRICTION_OPTIONS = [
  'Getting started',
  'Too many steps',
  'Overthinking',
  'Not sure what to do',
  'Feeling resistance',
  'Low energy',
  'Something else',
];

export const FrictionQuestion = () => {
  const { setFrictionInput, classifyBlock, isLoading, prevStep } = useOnboarding();
  const [selected, setSelected] = useState('');
  const [customInput, setCustomInput] = useState('');
  const showCustom = selected === 'Something else';

  const handleContinue = async () => {
    const finalInput = showCustom ? customInput : selected;
    setFrictionInput(finalInput);
    await classifyBlock();
  };

  const isDisabled = !selected || (showCustom && !customInput.trim());

  return (
    <div className="min-h-screen bg-[#242424] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="mb-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Step 2 of 2
        </div>

        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400">
          <Sparkles size={12} className="text-yellow-500" />
          <span>The Momentum Engine v1.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
          What part of this feels heavy or unclear?
        </h1>

        <p className="text-lg text-zinc-400 mb-8 max-w-lg mx-auto">
          Choose the option that best matches why you haven't started.
        </p>

        <div className="max-w-lg mx-auto space-y-3 mb-8">
          {FRICTION_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setSelected(option)}
              className={`w-full px-6 py-4 rounded-xl font-medium transition-all border text-left ${
                selected === option
                  ? 'bg-white text-black border-white'
                  : 'bg-zinc-900/50 text-white border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {showCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="max-w-lg mx-auto mb-8"
          >
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Describe what's holding you back..."
              rows={3}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all resize-none"
            />
          </motion.div>
        )}

        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            disabled={isDisabled || isLoading}
            className="w-full bg-white text-black font-semibold py-5 px-6 rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Analyzing pattern...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
