import React, { useState } from 'react';
import { fetchMomentumFromServer } from '../services/momentumApi';
import { parseMomentumResponse } from '../services/responseParser';
import FocusMode from './FocusMode';
import { Sparkles, Clock, Play, RefreshCw, Lightbulb } from 'lucide-react';

const MomentumUI = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      setError('Please enter what you want to accomplish');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const rawResponse = await fetchMomentumFromServer(input);
      const parsedResponse = parseMomentumResponse(rawResponse);
      setResponse(parsedResponse);
      setInput(''); // Clear input on success
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to generate momentum plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartFocus = (task, index) => {
    setActiveTask({ ...task, index });
  };

  const handleCompleteFocus = () => {
    // Task completed
    setActiveTask(null);
    // Could trigger confetti or celebration here
  };

  const handleExitFocus = () => {
    setActiveTask(null);
  };

  const handleRedo = async () => {
    // Placeholder for redo functionality
    setError('Redo functionality coming soon!');
    setTimeout(() => setError(null), 3000);
  };

  const handleDeepDive = async (task) => {
    // Placeholder for deep dive functionality
    console.log('Deep dive into task:', task.title);
    setError('Deep dive functionality coming soon!');
    setTimeout(() => setError(null), 3000);
  };

  const handleReset = () => {
    setResponse(null);
    setError(null);
  };

  // If in focus mode, render FocusMode component
  if (activeTask) {
    return (
      <FocusMode
        task={activeTask}
        onComplete={handleCompleteFocus}
        onExit={handleExitFocus}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#242424] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-indigo-500" size={32} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Momentum
            </h1>
          </div>
          <p className="text-zinc-400 text-lg">
            Build unstoppable momentum. One task at a time.
          </p>
        </div>

        {/* Input Section */}
        {!response && (
          <div className="mb-12">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="momentum-input" className="block text-sm font-medium text-zinc-400 mb-2">
                  What do you want to accomplish?
                </label>
                <input
                  id="momentum-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., Finish my presentation, Start learning React, Write a blog post"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating your momentum plan...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Momentum Plan
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="space-y-8">
            {/* Roast */}
            <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-3 text-indigo-300">Your Wake-Up Call 🔥</h2>
              <p className="text-lg text-white">{response.roast}</p>
            </div>

            {/* Tasks */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Your Action Plan</h2>
              <div className="grid gap-4">
                {response.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white font-bold rounded-full text-sm">
                            {index + 1}
                          </span>
                          <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                        </div>
                        <p className="text-zinc-400 mb-3">{task.description}</p>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <Clock size={16} />
                          <span>{task.estimated_minutes} minutes</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => handleStartFocus(task, index)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Play size={16} />
                        Start Focus
                      </button>
                      <button
                        onClick={() => handleRedo()}
                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <RefreshCw size={16} />
                        Redo
                      </button>
                      <button
                        onClick={() => handleDeepDive(task)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Lightbulb size={16} />
                        Deep Dive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                Start New Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentumUI;
