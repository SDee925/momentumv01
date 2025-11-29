import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const OnboardingContext = createContext({});

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stuckInput, setStuckInput] = useState('');
  const [frictionInput, setFrictionInput] = useState('');
  const [blockPattern, setBlockPattern] = useState('');
  const [blockReasoning, setBlockReasoning] = useState('');
  const [momentumSequence, setMomentumSequence] = useState({});
  const [userPreferences, setUserPreferences] = useState({});

  const callOnboardingAI = async (action, payload) => {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/momentum-ai`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...payload }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI service error');
    }

    return response.json();
  };

  const classifyBlock = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await callOnboardingAI('classifyBlockPattern', {
        stuckInput,
        frictionInput,
      });
      setBlockPattern(result.blockPattern);
      setBlockReasoning(result.reasoning);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to classify block pattern');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSequence = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await callOnboardingAI('generateMomentumSequence', {
        stuckInput,
        frictionInput: blockPattern,
      });
      setMomentumSequence(result);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Failed to generate momentum sequence');
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnboardingData = async () => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        stuck_input: stuckInput,
        friction_input: frictionInput,
        block_pattern: blockPattern,
        block_reasoning: blockReasoning,
        momentum_sequence: momentumSequence,
        user_preferences: userPreferences,
        onboarding_completed_at: new Date().toISOString(),
      });

    if (error) throw error;
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await saveOnboardingData();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to save onboarding data');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const value = {
    step,
    setStep,
    isLoading,
    error,
    stuckInput,
    setStuckInput,
    frictionInput,
    setFrictionInput,
    blockPattern,
    blockReasoning,
    momentumSequence,
    userPreferences,
    setUserPreferences,
    classifyBlock,
    generateSequence,
    completeOnboarding,
    nextStep,
    prevStep,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
