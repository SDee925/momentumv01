import React, { createContext, useContext, useState, useEffect } from 'react';
import { generatePlaybook, rerollTask, breakDownTask } from '../services/openrouter';

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

    // History persistence
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('momentum_history');
        return saved ? JSON.parse(saved) : [];
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const generate = async (focusArea) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await generatePlaybook(apiKey, focusArea);
            // Add timestamp and empty journal to the new playbook
            const newPlaybook = {
                ...data,
                createdAt: new Date().toISOString(),
                journalEntry: ""
            };
            setPlaybook(newPlaybook);
            setCompletedActions([]);
        } catch (err) {
            setError(err.message || "Failed to generate playbook");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReroll = async (actionId, currentTitle) => {
        if (!playbook) return;

        const actionIndex = playbook.actions.findIndex(a => a.id === actionId);
        if (actionIndex === -1) return;

        setIsLoading(true);
        try {
            const newAction = await rerollTask(apiKey, playbook.focusArea, currentTitle);
            const newActions = [...playbook.actions];
            newActions[actionIndex] = { ...newAction, id: actionId };

            setPlaybook({
                ...playbook,
                actions: newActions
            });
        } catch (err) {
            console.error("Reroll failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeepDive = async (actionId, actionTitle) => {
        if (!playbook) return;

        // Set loading state for specific action? 
        // For simplicity, let's use global loading or we need a way to track which action is loading.
        // Let's use a new state for "actionLoading" if we want to be precise, 
        // but for now global isLoading is okay, or we can pass a callback.
        // Actually, let's just use isLoading for now.
        setIsLoading(true);

        try {
            const subActions = await breakDownTask(apiKey, playbook.focusArea, actionTitle);

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
    };

    const updateJournalEntry = (entry) => {
        if (!playbook) return;
        setPlaybook(prev => ({ ...prev, journalEntry: entry }));
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
    };

    const reset = () => {
        // Optional: Confirm before losing unsaved progress if not archiving?
        // For now, reset just clears current state.
        setPlaybook(null);
        setCompletedActions([]);
        setError(null);
    };

    const value = {
        apiKey,
        setApiKey,
        playbook,
        history,
        isLoading,
        error,
        generate,
        handleReroll,
        handleDeepDive,
        completedActions,
        toggleAction,
        toggleSubAction,
        updateJournalEntry,
        archivePlaybook,
        reset
    };

    return (
        <MomentumContext.Provider value={value}>
            {children}
        </MomentumContext.Provider>
    );
};
