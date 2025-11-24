import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setMessage('Check your inbox for a sign-in link.');
    } catch (err) {
      setMessage(err.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setMessage('Signed out');
    } catch (err) {
      setMessage(err.message || 'Sign-out failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSignIn} className="flex gap-2 items-center">
        <input className="border px-2 py-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <button className="bg-blue-500 text-white px-3 py-1 rounded" disabled={loading}>{loading ? '...' : 'Sign in'}</button>
        <button type="button" onClick={handleSignOut} className="ml-2 text-sm">Sign out</button>
      </form>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}
