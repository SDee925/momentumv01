import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';

export const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Zap,
      title: "Break Through Inaction",
      description: "Momentum helps you escape the paralysis of overthinking with ruthless, actionable plans.",
      color: "text-yellow-400"
    },
    {
      icon: Target,
      title: "AI-Powered Action Plans",
      description: "Get specific, immediate tasks designed to break your unique patterns of procrastination.",
      color: "text-blue-400"
    },
    {
      icon: TrendingUp,
      title: "Build Real Progress",
      description: "Track your momentum across immediate, medium, and long-term horizons.",
      color: "text-green-400"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-12 shadow-2xl"
          >
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900/50 border border-slate-600"
              >
                {(() => {
                  const Icon = steps[currentStep].icon;
                  return <Icon className={`w-10 h-10 ${steps[currentStep].color}`} />;
                })()}
              </motion.div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white">
                  {steps[currentStep].title}
                </h2>
                <p className="text-lg text-slate-300 max-w-md mx-auto">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-8 bg-blue-500'
                        : 'w-2 bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-12">
              <button
                onClick={handleSkip}
                className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Skip
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/20"
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
