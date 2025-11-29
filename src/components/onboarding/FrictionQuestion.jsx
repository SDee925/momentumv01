import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../../context/OnboardingContext';

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
                What part of that feels heavy or unclear?
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FRICTION_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelected(option)}
                  className={`px-6 py-4 rounded-lg font-medium transition-all border ${
                    selected === option
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-900/70'
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
                className="space-y-2"
              >
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Describe what's holding you back..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </motion.div>
            )}

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={isDisabled || isLoading}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/20 disabled:shadow-none"
              >
                {isLoading ? 'Analyzing...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
