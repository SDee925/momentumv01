import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MomentumProvider } from './context/MomentumContext';
import { AuthForm } from './components/AuthForm';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import Layout from './components/Layout';
import { supabase } from './lib/supabase';

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_completed_at')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!profile || !profile.onboarding_completed_at) {
            setShowOnboarding(true);
          }
        } catch (err) {
          console.error('Failed to check onboarding status:', err);
        } finally {
          setCheckingProfile(false);
        }
      } else {
        setCheckingProfile(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <MomentumProvider>
      <Layout />
    </MomentumProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
