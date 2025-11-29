import { motion } from 'framer-motion';
import { useOnboarding } from '../../context/OnboardingContext';
import { Zap, TrendingUp, Settings } from 'lucide-react';

export const MomentumSequenceDisplay = () => {
  const { momentumSequence, nextStep } = useOnboarding();

  const steps = [
    {
      icon: Zap,
      label: 'Activation Move (90 seconds)',
      content: momentumSequence.activationMove,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/50',
    },
    {
      icon: TrendingUp,
      label: 'Momentum Move',
      content: momentumSequence.momentumMove,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/50',
    },
    {
      icon: Settings,
      label: 'Systems Move',
      content: momentumSequence.systemsMove,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/50',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 md:p-12 shadow-2xl">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Your 3-Step Momentum Sequence
              </h1>
              <p className="text-lg text-slate-400">
                Follow these steps to break through your block
              </p>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border ${step.bgColor} ${step.borderColor}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Icon className={`w-6 h-6 ${step.color}`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-white">
                          {step.label}
                        </h3>
                        <p className="text-slate-300">
                          {step.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={nextStep}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/20"
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
