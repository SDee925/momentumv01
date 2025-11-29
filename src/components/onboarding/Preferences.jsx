import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../../context/OnboardingContext';

const BUILDING_OPTIONS = [
  'Side project',
  'New habit',
  'Career move',
  'Personal growth',
  'Something else',
];

const PACE_OPTIONS = [
  'Light progress',
  'Steady pace',
  'High intensity',
];

export const Preferences = () => {
  const { userPreferences, setUserPreferences, nextStep, prevStep } = useOnboarding();
  const [building, setBuilding] = useState(userPreferences.building || '');
  const [pace, setPace] = useState(userPreferences.pace || '');

  const handleContinue = () => {
    setUserPreferences({ building, pace });
    nextStep();
  };

  const isDisabled = !building || !pace;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 md:p-12 shadow-2xl">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Quick preferences
              </h1>
              <p className="text-lg text-slate-400">
                Help us personalize your experience
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-lg font-medium text-white block">
                  What are you building toward right now?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BUILDING_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => setBuilding(option)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all border ${
                        building === option
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-900/70'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-lg font-medium text-white block">
                  How fast do you like to move?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {PACE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => setPace(option)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all border ${
                        pace === option
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-900/70'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={isDisabled}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/20 disabled:shadow-none"
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
