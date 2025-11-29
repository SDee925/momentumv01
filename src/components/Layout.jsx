import React from 'react';
import { useMomentum } from '../context/MomentumContext';
import InputSection from './InputSection';
import Dashboard from './Dashboard';

const Layout = () => {
    const { playbook, generate, isLoading, error } = useMomentum();

    return (
        <div className="min-h-screen bg-[#242424] text-white font-sans selection:bg-zinc-500/30">
            <main>
                {playbook ? (
                    <Dashboard />
                ) : (
                    <InputSection onGenerate={generate} isLoading={isLoading} />
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
