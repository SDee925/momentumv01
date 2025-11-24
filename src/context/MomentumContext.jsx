import React, { createContext, useContext, useState, useEffect } from 'react';
import { generatePlaybook, rerollTask as clientRerollTask, breakDownTask as clientBreakDownTask } from '../services/openrouter';
import { generateTasks, rerollTask as serverRerollTask, breakDownTask as serverBreakDownTask, savePlaybook, getPlaybooks, saveHistory as apiSaveHistory, getHistory as apiGetHistory, saveJournal } from '../services/momentumApi';
import { supabase } from '../services/supabaseClient';

const MomentumContext = createContext();

export const useMomentum = () => {
    const context = useContext(MomentumContext);
    if (!context) {
        throw new Error('useMomentum must be used within a MomentumProvider');
    }
    return context;
};

export const MomentumProvider = ({ children }) => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('momentum_api_key') || '');

    // Persist playbook and completedActions
    const [playbook, setPlaybook] = useState(() => {
        const saved = localStorage.getItem('momentum_playbook');
        return saved ? JSON.parse(saved) : null;
    });

    const [completedActions, setCompletedActions] = useState(() => {
        const saved = localStorage.getItem('momentum_completed_actions');
        return saved ? JSON.parse(saved) : [];
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('momentum_history');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeTask, setActiveTask] = useState(() => {
        const saved = localStorage.getItem('momentum_active_task');
        return saved ? JSON.parse(saved) : null;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [lastPlaybookSync, setLastPlaybookSync] = useState(null);
    const [lastJournalSync, setLastJournalSync] = useState(null);
    const [lastHistorySync, setLastHistorySync] = useState(null);
    const [actionSyncStatus, setActionSyncStatus] = useState({}); // { [actionId]: 'idle'|'saving'|'synced'|'error' }

    const setActionStatus = (actionId, status) => {
        setActionSyncStatus(prev => ({ ...prev, [actionId]: status }));
    };

    // Persistence Effects
    useEffect(() => {
        if (apiKey) localStorage.setItem('momentum_api_key', apiKey);
    }, [apiKey]);

    useEffect(() => {
        if (playbook) {
            localStorage.setItem('momentum_playbook', JSON.stringify(playbook));
        } else {
            localStorage.removeItem('momentum_playbook');
        }
    }, [playbook]);

    useEffect(() => {
        localStorage.setItem('momentum_completed_actions', JSON.stringify(completedActions));
    }, [completedActions]);

    useEffect(() => {
        localStorage.setItem('momentum_history', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        if (activeTask) {
            localStorage.setItem('momentum_active_task', JSON.stringify(activeTask));
        } else {
            localStorage.removeItem('momentum_active_task');
        }
    }, [activeTask]);

    // Auth: hydrate session & subscribe to auth state changes
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const sessionUser = data?.session?.user ?? null;
                if (mounted) setUser(sessionUser);
            } catch (err) {
                // ignore
            }
        })();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            mounted = false;
            try { listener?.subscription?.unsubscribe?.(); } catch (e) {}
        };
    }, []);

    // Keep active task in sync with latest playbook changes (deep dives, micro-steps)
    useEffect(() => {
        if (!playbook || !activeTask) return;
        const latest = playbook.actions.find(action => action.id === activeTask.id);
        if (!latest) {
            setActiveTask(null);
            return;
        }

        if (latest !== activeTask) {
            setActiveTask(latest);
        }
    }, [playbook, activeTask?.id]);

    const generate = async (focusArea) => {
        setIsLoading(true);
        setError(null);
        try {
            // Prefer server-side function (momentumApi). Falls back to client-side openrouter if unavailable.
            let data = null;
            try {
                data = await generateTasks(focusArea);
            } catch (serverErr) {
                console.warn('momentumApi.generateTasks failed, falling back to openrouter:', serverErr);
            }

            if (!data) {
                // fallback: call client-side openrouter using apiKey
                data = await generatePlaybook(apiKey, focusArea);
            }

            // Add timestamp and empty journal to the new playbook
            const newPlaybook = {
                ...data,
                createdAt: new Date().toISOString(),
                journalEntry: ""
            };
            setPlaybook(newPlaybook);
            setCompletedActions([]);

            // Persist playbook for signed-in users (server-backed)
            if (user) {
                try {
                    const { data } = await supabase.auth.getSession();
                    const accessToken = data?.session?.access_token;
                    if (!accessToken) throw new Error('Missing access token');
                    await savePlaybook(newPlaybook, accessToken);
                    setLastPlaybookSync(new Date().toISOString());
                } catch (err) {
                    console.warn('Failed to save playbook to Supabase', err);
                }
            }
        } catch (err) {
            setError(err.message || "Failed to generate playbook");
        } finally {
            setIsLoading(false);
        }
    };

    // When user signs in, try to sync remote playbooks/history into local state
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const accessToken = data?.session?.access_token;
                if (!accessToken) return;

                const remoteHistory = await apiGetHistory(accessToken).catch(() => null);
                if (remoteHistory && remoteHistory.length) {
                    const mapped = remoteHistory.map(r => r.payload || r);
                    setHistory(mapped);
                }

                const remotePlaybooks = await getPlaybooks(accessToken).catch(() => null);
                if (remotePlaybooks && remotePlaybooks.length && !playbook) {
                    setPlaybook(remotePlaybooks[0].payload || remotePlaybooks[0]);
                }
            } catch (err) {
                console.warn('Failed to sync from Supabase', err);
            }
        })();
    }, [user]);

    const handleReroll = async (actionId, currentTitle) => {
        if (!playbook) return;

        const actionIndex = playbook.actions.findIndex(a => a.id === actionId);
        if (actionIndex === -1) return;

        setIsLoading(true);
        try {
            // Try server-side reroll first, fall back to client-side openrouter
            let newAction = null;
            try {
                newAction = await serverRerollTask(currentTitle, playbook.focusArea);
            } catch (srvErr) {
                console.warn('server reroll failed, falling back to client:', srvErr);
            }

            if (!newAction) {
                newAction = await clientRerollTask(apiKey, playbook.focusArea, currentTitle);
            }
            const newActions = [...playbook.actions];
            newActions[actionIndex] = { ...newAction, id: actionId };

            setPlaybook({
                ...playbook,
                actions: newActions
            });
            // persist the deep-dive change for this action
            (async () => {
                setActionStatus(actionId, 'saving');
                try {
                    if (user) await saveCurrentPlaybook();
                    setActionStatus(actionId, 'synced');
                    setTimeout(() => setActionStatus(actionId, 'idle'), 2500);
                } catch (err) {
                    console.warn('Failed to persist deep dive change', err);
                    setActionStatus(actionId, 'error');
                    setTimeout(() => setActionStatus(actionId, 'idle'), 4000);
                }
            })();
            // persist the reroll change for this action
            (async () => {
                setActionStatus(actionId, 'saving');
                try {
                    if (user) await saveCurrentPlaybook();
                    setActionStatus(actionId, 'synced');
                    setTimeout(() => setActionStatus(actionId, 'idle'), 2500);
                } catch (err) {
                    console.warn('Failed to persist reroll change', err);
                    setActionStatus(actionId, 'error');
                    setTimeout(() => setActionStatus(actionId, 'idle'), 4000);
                }
            })();
        } catch (err) {
            console.error("Reroll failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeepDive = async (actionId, actionTitle) => {
        if (!playbook) return;

        setIsLoading(true);

        try {
            // Try server-side breakdown first, fall back to client-side
            let subActions = null;
            try {
                subActions = await serverBreakDownTask(actionTitle, playbook.focusArea);
            } catch (srvErr) {
                console.warn('server breakdown failed, falling back to client:', srvErr);
            }

            if (!subActions) {
                subActions = await clientBreakDownTask(apiKey, playbook.focusArea, actionTitle);
            }

            const actionIndex = playbook.actions.findIndex(a => a.id === actionId);
            if (actionIndex === -1) return;

            const newActions = [...playbook.actions];
            newActions[actionIndex] = {
                ...newActions[actionIndex],
                subActions: subActions.map(s => ({ ...s, isCompleted: false }))
            };

            setPlaybook({
                ...playbook,
                actions: newActions
            });
        } catch (err) {
            console.error("Deep dive failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAction = (actionId) => {
        setCompletedActions(prev => {
            if (prev.includes(actionId)) {
                return prev.filter(id => id !== actionId);
            } else {
                return [...prev, actionId];
            }
        });
        // optimistic save for this action
        (async () => {
            setActionStatus(actionId, 'saving');
            try {
                if (user) await saveCurrentPlaybook();
                setActionStatus(actionId, 'synced');
                setTimeout(() => setActionStatus(actionId, 'idle'), 2500);
            } catch (err) {
                console.warn('Failed to persist action toggle', err);
                setActionStatus(actionId, 'error');
                setTimeout(() => setActionStatus(actionId, 'idle'), 4000);
            }
        })();
    };

    const toggleSubAction = (actionId, subActionId) => {
        if (!playbook) return;

        const actionIndex = playbook.actions.findIndex(a => a.id === actionId);
        if (actionIndex === -1) return;

        const action = playbook.actions[actionIndex];
        if (!action.subActions) return;

        const subActionIndex = action.subActions.findIndex(s => s.id === subActionId);
        if (subActionIndex === -1) return;

        const newSubActions = [...action.subActions];
        newSubActions[subActionIndex] = {
            ...newSubActions[subActionIndex],
            isCompleted: !newSubActions[subActionIndex].isCompleted
        };

        const newActions = [...playbook.actions];
        newActions[actionIndex] = { ...action, subActions: newSubActions };

        setPlaybook({ ...playbook, actions: newActions });
        // optimistic save for this action's subActions
        (async () => {
            setActionStatus(actionId, 'saving');
            try {
                if (user) await saveCurrentPlaybook();
                setActionStatus(actionId, 'synced');
                setTimeout(() => setActionStatus(actionId, 'idle'), 2500);
            } catch (err) {
                console.warn('Failed to persist subAction toggle', err);
                setActionStatus(actionId, 'error');
                setTimeout(() => setActionStatus(actionId, 'idle'), 4000);
            }
        })();
    };

    const updateJournalEntry = (entry) => {
        if (!playbook) return;
        setPlaybook(prev => ({ ...prev, journalEntry: entry }));
    };

    const enterTunnel = (taskId) => {
        if (!playbook) return;
        const task = playbook.actions.find(a => a.id === taskId);
        if (task) {
            setActiveTask(task);
        }
    };

    const exitTunnel = (completed = false) => {
        if (completed && activeTask) {
            toggleAction(activeTask.id);
        }
        setActiveTask(null);
    };

    const archivePlaybook = () => {
        if (!playbook) return;

        const archivedSession = {
            ...playbook,
            completedActions,
            archivedAt: new Date().toISOString()
        };

        setHistory(prev => [archivedSession, ...prev]);
        setPlaybook(null);
        setCompletedActions([]);
        // Save archive to Supabase history table when signed in (server-backed)
        if (user) {
            (async () => {
                try {
                    const { data } = await supabase.auth.getSession();
                    const accessToken = data?.session?.access_token;
                    if (!accessToken) throw new Error('Missing access token');
                    await apiSaveHistory(archivedSession, accessToken);
                    setLastHistorySync(new Date().toISOString());
                } catch (err) {
                    console.warn('Failed to save archived session to Supabase', err);
                }
            })();
        }

    };

    const saveCurrentPlaybook = async () => {
        if (!playbook) return;
        if (!user) throw new Error('Must be signed in to save');
        try {
            const { data } = await supabase.auth.getSession();
            const accessToken = data?.session?.access_token;
            if (!accessToken) throw new Error('Missing access token');
            const saved = await savePlaybook(playbook, accessToken);
            setLastPlaybookSync(new Date().toISOString());
            return saved;
        } catch (err) {
            console.warn('Failed to save playbook', err);
            throw err;
        }
    };

    const saveJournalEntry = async (entry) => {
        if (!user) throw new Error('Must be signed in to save journal');
        try {
            const { data } = await supabase.auth.getSession();
            const accessToken = data?.session?.access_token;
            if (!accessToken) throw new Error('Missing access token');
            const saved = await saveJournal(entry, accessToken, playbook?.id ?? null);
            setLastJournalSync(new Date().toISOString());
            return saved;
        } catch (err) {
            console.warn('Failed to save journal', err);
            throw err;
        }
    };

    const reset = () => {
        setPlaybook(null);
        setCompletedActions([]);
        setError(null);
    };

    // Sync remote data when user signs in
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const accessToken = data?.session?.access_token;
                if (!accessToken) return;

                const remoteHistory = await apiGetHistory(accessToken).catch(() => null);
                if (remoteHistory && remoteHistory.length) {
                    const mapped = remoteHistory.map(r => r.payload || r);
                    setHistory(mapped);
                }

                const remotePlaybooks = await getPlaybooks(accessToken).catch(() => null);
                if (remotePlaybooks && remotePlaybooks.length && !playbook) {
                    setPlaybook(remotePlaybooks[0].payload || remotePlaybooks[0]);
                }
            } catch (err) {
                console.warn('Failed to sync from Supabase', err);
            }
        })();
    }, [user]);

    const value = {
        apiKey,
        setApiKey,
        user,
        actionSyncStatus,
        lastPlaybookSync,
        lastJournalSync,
        lastHistorySync,
        playbook,
        history,
        isLoading,
        error,
        generate,
        saveCurrentPlaybook,
        saveJournalEntry,
        handleReroll,
        handleDeepDive,
        completedActions,
        toggleAction,
        toggleSubAction,
        updateJournalEntry,
        archivePlaybook,
        reset,
        activeTask,
        enterTunnel,
        exitTunnel
    };

    return (
        <MomentumContext.Provider value={value}>
            {children}
        </MomentumContext.Provider>
    );
};
