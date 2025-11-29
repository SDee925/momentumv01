import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../../context/OnboardingContext';
import { CheckCircle } from 'lucide-react';

export const Complete = ({ onComplete }) => {
  const { completeOnboarding, isLoading, error } = useOnboarding();
  const [saveAttempted, setSaveAttempted] = useState(false);

  useEffect(() => {
    const saveAndComplete = async () => {
      if (!saveAttempted) {
        setSaveAttempted(true);
        const success = await completeOnboarding();
        if (success) {
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      }
    };

    saveAndComplete();
  }, [saveAttempted, completeOnboarding, onComplete]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 md:p-12 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="text-red-400 text-lg">
                Failed to save onboarding data: {error}
              </div>
              <button
                onClick={() => {
                  setSaveAttempted(false);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 md:p-12 shadow-2xl">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/50">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {isLoading ? 'Setting things up...' : "You're all set!"}
              </h1>
              <p className="text-lg text-slate-400">
                {isLoading ? 'Saving your momentum sequence' : 'Redirecting to your dashboard...'}
              </p>
            </div>

            {isLoading && (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
