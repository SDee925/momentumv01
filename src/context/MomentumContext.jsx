import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    callMomentumAI,
    createPlaybook,
    saveActions,
    getCurrentPlaybook,
    getArchivedPlaybooks,
    updateAction,
    replaceAction,
    saveSubActions,
    updateSubAction,
    updatePlaybookJournal,
    archivePlaybook as archivePlaybookDb
} from '../services/supabaseService';

const MomentumContext = createContext();

export const useMomentum = () => {
    const context = useContext(MomentumContext);
    if (!context) {
        throw new Error('useMomentum must be used within a MomentumProvider');
    }
    return context;
};

export const MomentumProvider = ({ children }) => {
    const [playbook, setPlaybook] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCurrentPlaybook();
        loadHistory();
    }, []);

    const loadCurrentPlaybook = async () => {
        try {
            const current = await getCurrentPlaybook();
            if (current) {
                const transformed = transformPlaybookFromDb(current);
                setPlaybook(transformed);
            }
        } catch (err) {
            console.error('Failed to load current playbook:', err);
        }
    };

    const loadHistory = async () => {
        try {
            const archived = await getArchivedPlaybooks();
            const transformed = archived.map(transformPlaybookFromDb);
            setHistory(transformed);
        } catch (err) {
            console.error('Failed to load history:', err);
        }
    };

    const transformPlaybookFromDb = (dbPlaybook) => {
        return {
            id: dbPlaybook.id,
            focusArea: dbPlaybook.focus_area,
            analysis: dbPlaybook.analysis,
            opportunities: dbPlaybook.opportunities,
            pitfalls: dbPlaybook.pitfalls,
            journalEntry: dbPlaybook.journal_entry || '',
            createdAt: dbPlaybook.created_at,
            archivedAt: dbPlaybook.archived_at,
            actions: dbPlaybook.actions?.map(action => ({
                id: action.id,
                title: action.title,
                description: action.description,
                horizon: action.horizon,
                rationale: action.rationale,
                isCompleted: action.is_completed,
                subActions: action.subActions?.map(sub => ({
                    id: sub.id,
                    title: sub.title,
                    isCompleted: sub.is_completed
                }))
            })) || []
        };
    };

    const generate = async (focusArea) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await callMomentumAI('generate', { focusArea });

            const playbookRecord = await createPlaybook({
                focusArea: data.focusArea,
                analysis: data.analysis,
                opportunities: data.opportunities,
                pitfalls: data.pitfalls,
                journalEntry: ''
            });

            await saveActions(playbookRecord.id, data.actions);

            const newPlaybook = {
                id: playbookRecord.id,
                focusArea: data.focusArea,
                analysis: data.analysis,
                opportunities: data.opportunities,
                pitfalls: data.pitfalls,
                journalEntry: '',
                createdAt: playbookRecord.created_at,
                actions: data.actions.map(action => ({
                    ...action,
                    isCompleted: false,
                    subActions: []
                }))
            };

            setPlaybook(newPlaybook);
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
            const newAction = await callMomentumAI('reroll', {
                focusArea: playbook.focusArea,
                rejectedTaskTitle: currentTitle
            });

            await replaceAction(actionId, newAction, actionIndex);

            const newActions = [...playbook.actions];
            newActions[actionIndex] = {
                ...newAction,
                id: actionId,
                isCompleted: false,
                subActions: []
            };

            setPlaybook({
                ...playbook,
                actions: newActions
            });
        } catch (err) {
            console.error("Reroll failed", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeepDive = async (actionId, actionTitle) => {
        if (!playbook) return;

        setIsLoading(true);

        try {
            const subActions = await callMomentumAI('breakdown', {
                focusArea: playbook.focusArea,
                parentTask: actionTitle
            });

            const subActionsWithCompletion = subActions.map(s => ({
                ...s,
                isCompleted: false
            }));

            await saveSubActions(actionId, subActionsWithCompletion);

            const actionIndex = playbook.actions.findIndex(a => a.id === actionId);
            if (actionIndex === -1) return;

            const newActions = [...playbook.actions];
            newActions[actionIndex] = {
                ...newActions[actionIndex],
                subActions: subActionsWithCompletion
            };

            setPlaybook({
                ...playbook,
                actions: newActions
            });
        } catch (err) {
            console.error("Deep dive failed", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAction = async (actionId) => {
        if (!playbook) return;

        const actionIndex = playbook.actions.findIndex(a => a.id === actionId);
        if (actionIndex === -1) return;

        const action = playbook.actions[actionIndex];
        const newCompletedState = !action.isCompleted;

        try {
            await updateAction(actionId, { is_completed: newCompletedState });

            const newActions = [...playbook.actions];
            newActions[actionIndex] = {
                ...action,
                isCompleted: newCompletedState
            };

            setPlaybook({
                ...playbook,
                actions: newActions
            });
        } catch (err) {
            console.error("Toggle action failed", err);
            setError(err.message);
        }
    };

    const toggleSubAction = async (actionId, subActionId) => {
        if (!playbook) return;

        const actionIndex = playbook.actions.findIndex(a => a.id === actionId);
        if (actionIndex === -1) return;

        const action = playbook.actions[actionIndex];
        if (!action.subActions) return;

        const subActionIndex = action.subActions.findIndex(s => s.id === subActionId);
        if (subActionIndex === -1) return;

        const subAction = action.subActions[subActionIndex];
        const newCompletedState = !subAction.isCompleted;

        try {
            await updateSubAction(subActionId, { is_completed: newCompletedState });

            const newSubActions = [...action.subActions];
            newSubActions[subActionIndex] = {
                ...subAction,
                isCompleted: newCompletedState
            };

            const newActions = [...playbook.actions];
            newActions[actionIndex] = { ...action, subActions: newSubActions };

            setPlaybook({ ...playbook, actions: newActions });
        } catch (err) {
            console.error("Toggle sub-action failed", err);
            setError(err.message);
        }
    };

    const updateJournalEntry = async (entry) => {
        if (!playbook) return;

        try {
            await updatePlaybookJournal(playbook.id, entry);
            setPlaybook(prev => ({ ...prev, journalEntry: entry }));
        } catch (err) {
            console.error("Update journal failed", err);
            setError(err.message);
        }
    };

    const archivePlaybook = async () => {
        if (!playbook) return;

        try {
            await archivePlaybookDb(playbook.id);

            const archivedPlaybook = {
                ...playbook,
                archivedAt: new Date().toISOString()
            };

            setHistory(prev => [archivedPlaybook, ...prev]);
            setPlaybook(null);
        } catch (err) {
            console.error("Archive playbook failed", err);
            setError(err.message);
        }
    };

    const reset = () => {
        setPlaybook(null);
        setError(null);
    };

    const value = {
        playbook,
        history,
        isLoading,
        error,
        generate,
        handleReroll,
        handleDeepDive,
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
