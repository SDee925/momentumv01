import { useMomentum } from '../context/MomentumContext';
import { useAuth } from '../context/AuthContext';
import InputSection from './InputSection';
import Dashboard from './Dashboard';
import { LogOut } from 'lucide-react';

const Layout = () => {
    const { playbook, generate, isLoading, error } = useMomentum();
    const { signOut, user } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#242424] text-white font-sans selection:bg-zinc-500/30">
            <header className="fixed top-0 right-0 p-4 z-50">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all"
                    title="Sign out"
                >
                    <span className="text-sm">{user?.email}</span>
                    <LogOut className="w-4 h-4" />
                </button>
            </header>

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
