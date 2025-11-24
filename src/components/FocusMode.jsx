import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, CheckCircle2, X } from 'lucide-react';

const FocusMode = ({ task, onComplete, onExit }) => {
  const [timeRemaining, setTimeRemaining] = useState(task.estimated_minutes * 60); // Convert to seconds
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isPaused && !isCompleted && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, isCompleted, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleDone = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onComplete();
  };

  const handleExit = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onExit();
  };

  const progress = ((task.estimated_minutes * 60 - timeRemaining) / (task.estimated_minutes * 60)) * 100;

  return (
    <div className="fixed inset-0 bg-[#242424] z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl px-8">
        {/* Exit button */}
        <button
          onClick={handleExit}
          className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white transition-colors"
          aria-label="Exit focus mode"
        >
          <X size={24} />
        </button>

        {/* Task Info */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{task.title}</h1>
          <p className="text-lg text-zinc-400">{task.description}</p>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative w-64 h-64 mb-8">
            {/* Progress circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#374151"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#6366f1"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            {/* Time display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-white tabular-nums">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* Status message */}
          {isCompleted && (
            <div className="text-2xl font-semibold text-green-400 mb-6 flex items-center gap-2">
              <CheckCircle2 size={28} />
              <span>Time&apos;s up! Great work!</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isCompleted && (
            <button
              onClick={handlePauseResume}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isPaused ? (
                <>
                  <Play size={20} />
                  Resume
                </>
              ) : (
                <>
                  <Pause size={20} />
                  Pause
                </>
              )}
            </button>
          )}
          
          <button
            onClick={handleDone}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <CheckCircle2 size={20} />
            Done
          </button>
        </div>

        {/* Motivational text */}
        <div className="text-center mt-12">
          <p className="text-zinc-500 text-sm">
            Stay focused. You&apos;ve got this! 💪
          </p>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
