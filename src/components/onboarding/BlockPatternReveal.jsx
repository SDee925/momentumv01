import { motion } from 'framer-motion';
import { useOnboarding } from '../../context/OnboardingContext';
import { Zap } from 'lucide-react';

export const BlockPatternReveal = () => {
  const { blockPattern, blockReasoning, generateSequence, isLoading } = useOnboarding();

  const handleShowSteps = async () => {
    await generateSequence();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 md:p-12 shadow-2xl">
          <div className="space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/50">
                <Zap className="w-10 h-10 text-yellow-400" />
              </div>
            </motion.div>

            <div className="space-y-4 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Looks like a {blockPattern}.
              </h1>
              <p className="text-lg text-slate-300 max-w-lg mx-auto">
                {blockReasoning}
              </p>
              <p className="text-base text-slate-400">
                Builders and go-getters hit this pattern all the time. Here's how we break it.
              </p>
            </div>

            <button
              onClick={handleShowSteps}
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/20 disabled:shadow-none"
            >
              {isLoading ? 'Generating Your Steps...' : 'Show My Steps'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
