import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MomentumProvider } from './context/MomentumContext';
import { AuthForm } from './components/AuthForm';
import { Onboarding } from './components/Onboarding';
import Layout from './components/Layout';

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  if (loading) {
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
    return <Onboarding onComplete={handleOnboardingComplete} />;
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
