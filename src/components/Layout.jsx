import React, { useState } from 'react';
import { useMomentum } from '../context/MomentumContext';
import InputSection from './InputSection';
import Dashboard from './Dashboard';
import MomentumUI from './MomentumUI';
import APIKeyModal from './APIKeyModal';
import { Settings } from 'lucide-react';

const Layout = () => {
    const { apiKey, setApiKey, playbook, generate, isLoading, error } = useMomentum();
    const [isSettingsOpen, setIsSettingsOpen] = useState(!apiKey);
    const useSupabaseFlow = true;

    return (
        <div className="min-h-screen bg-[#242424] text-white font-sans selection:bg-indigo-500/30">
            {!apiKey && (
                <div className="fixed top-0 left-0 right-0 bg-indigo-600 text-white text-xs font-bold text-center py-2 z-50">
                    Demo Mode: Please configure your API Key to start.
                </div>
            )}

            <button
                onClick={() => setIsSettingsOpen(true)}
                className="fixed top-4 right-4 z-40 p-2 text-zinc-500 hover:text-white bg-zinc-900/50 rounded-full backdrop-blur-sm border border-zinc-800 transition-colors"
            >
                <Settings size={20} />
            </button>

            <APIKeyModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={setApiKey}
            />

            <main>
                {useSupabaseFlow ? (
                    <MomentumUI />
                ) : (
                    <>
                        {playbook ? (
                            <Dashboard />
                        ) : (
                            <InputSection onGenerate={generate} isLoading={isLoading} />
                        )}
                    </>
                )}
            </main>

            {error && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500 text-red-200 px-6 py-3 rounded-xl backdrop-blur-md shadow-xl">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Layout;
