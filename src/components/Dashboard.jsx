import React, { useState } from 'react';
import { useMomentum } from '../context/MomentumContext';
import AnalysisPanel from './AnalysisPanel';
import MomentumMap from './MomentumMap';
import ProgressBar from './ProgressBar';
import JournalSection from './JournalSection';
import HistoryView from './HistoryView';
import FocusMode from './FocusMode';
import { ArrowLeft, Share2, History, Archive } from 'lucide-react';
import { motion } from 'framer-motion';
const Dashboard = () => {
    const {
        playbook,
        completedActions,
        toggleAction,
        handleReroll,
        reset,
        isLoading,
        updateJournalEntry,
        archivePlaybook,
        saveCurrentPlaybook,
        lastPlaybookSync,
        saveJournalEntry,
        lastJournalSync,
        history,
        handleDeepDive,
        toggleSubAction,
        activeTask,
        exitTunnel,
        lastHistorySync,
        enterTunnel
        , actionSyncStatus
    } = useMomentum();

    const [view, setView] = useState(() => localStorage.getItem('momentum_dashboard_view') || 'active');

    const handleSetView = (newView) => {
        setView(newView);
        localStorage.setItem('momentum_dashboard_view', newView);
    };

    if (!playbook && view !== 'history') return null;

    if (activeTask) {
        return (
            <FocusMode
                task={activeTask}
                onComplete={() => exitTunnel(true)}
                onExit={() => exitTunnel(false)}
                onToggleSubAction={toggleSubAction}
                lastHistorySync={lastHistorySync}
            />
        );
    }

    const totalActions = playbook ? playbook.actions.length : 0;
    const completedCount = completedActions.length;

    const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error

    const handleSave = async () => {
        if (!playbook) return;
        setSaveStatus('saving');
        try {
            await saveCurrentPlaybook();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err) {
            console.warn('Save failed', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 4000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto px-4 py-8 pb-24"
        >
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">New Focus</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                        onClick={() => handleSetView('active')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'active' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        disabled={!playbook}
                    >
                        Active Focus
                    </button>
                    <button
                        onClick={() => handleSetView('history')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'history' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <History size={14} />
                        History
                    </button>
                </div>
            </header>

            <div className="flex justify-end mb-4 items-center gap-3">
                <button
                    onClick={handleSave}
                    className="mr-3 px-4 py-2 bg-zinc-800 text-zinc-200 rounded-md text-sm"
                    disabled={!playbook || saveStatus === 'saving'}
                >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                </button>

                {saveStatus === 'saved' && (
                    <div className="text-sm text-emerald-400">Saved ✓</div>
                )}

                {saveStatus === 'error' && (
                    <div className="text-sm text-red-400">Save failed</div>
                )}
            </div>

            {view === 'history' ? (
                <HistoryView history={history} />
            ) : (
                <>
                    <div className="mb-12 flex items-baseline gap-3">
                        <h1 className="text-4xl font-bold text-white mb-2 capitalize">
                            {playbook.focusArea}
                        </h1>
                        <div className="text-sm text-zinc-500">Momentum Protocol v1.0</div>
                        <div className="ml-auto text-sm text-zinc-400 flex items-center gap-2">
                            {lastPlaybookSync ? (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><path d="M12 15V3"/></svg>
                                    <span>Saved {new Date(lastPlaybookSync).toLocaleString()}</span>
                                </>
                            ) : (
                                <span className="text-zinc-600">Not saved</span>
                            )}
                        </div>
                    </div>

                    <AnalysisPanel
                        analysis={playbook.analysis}
                        opportunities={playbook.opportunities}
                    />

                    <div className="mb-12 sticky top-0 bg-[#242424]/80 backdrop-blur-md py-4 z-10 border-b border-zinc-800/50">
                        <ProgressBar total={totalActions} completed={completedCount} />
                    </div>

                    <MomentumMap
                        actions={playbook.actions}
                        completedActions={completedActions}
                        onToggle={toggleAction}
                        onReroll={handleReroll}
                        isRerolling={isLoading}
                        onDeepDive={handleDeepDive}
                        onToggleSubAction={toggleSubAction}
                        onEnterTunnel={enterTunnel}
                        actionSyncStatus={actionSyncStatus}
                    />

                    <div className="mt-12 border-t border-zinc-800 pt-12">
                        <JournalSection
                                entry={playbook.journalEntry || ""}
                                onChange={updateJournalEntry}
                                onSave={async (entry) => await saveJournalEntry(entry)}
                                lastSynced={lastJournalSync}
                        />

                        <div className="flex justify-end">
                            <button
                                onClick={archivePlaybook}
                                className="flex items-center gap-2 bg-zinc-100 text-black px-6 py-3 rounded-xl font-bold hover:bg-white transition-colors"
                            >
                                <Archive size={20} />
                                Finish & Archive Session
                            </button>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default Dashboard;
