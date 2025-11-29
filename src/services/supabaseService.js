import { supabase } from '../lib/supabase';

export const callMomentumAI = async (action, payload) => {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/momentum-ai`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI service error');
  }

  return response.json();
};

export const createPlaybook = async (playbookData) => {
  const { data, error } = await supabase
    .from('playbooks')
    .insert({
      focus_area: playbookData.focusArea,
      analysis: playbookData.analysis,
      opportunities: playbookData.opportunities,
      pitfalls: playbookData.pitfalls,
      journal_entry: playbookData.journalEntry || '',
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const saveActions = async (playbookId, actions) => {
  const actionsToInsert = actions.map((action, index) => ({
    playbook_id: playbookId,
    id: action.id,
    title: action.title,
    description: action.description,
    horizon: action.horizon,
    rationale: action.rationale,
    is_completed: false,
    position: index,
  }));

  const { error } = await supabase
    .from('actions')
    .insert(actionsToInsert);

  if (error) throw error;
};

export const getPlaybook = async (playbookId) => {
  const { data: playbook, error: playbookError } = await supabase
    .from('playbooks')
    .select('*')
    .eq('id', playbookId)
    .maybeSingle();

  if (playbookError) throw playbookError;
  if (!playbook) return null;

  const { data: actions, error: actionsError } = await supabase
    .from('actions')
    .select('*, sub_actions(*)')
    .eq('playbook_id', playbookId)
    .order('position');

  if (actionsError) throw actionsError;

  return {
    ...playbook,
    actions: actions.map(action => ({
      ...action,
      subActions: action.sub_actions?.sort((a, b) => a.position - b.position) || [],
    })),
  };
};

export const getCurrentPlaybook = async () => {
  const { data: playbooks, error } = await supabase
    .from('playbooks')
    .select('*, actions(*, sub_actions(*))')
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!playbooks || playbooks.length === 0) return null;

  const playbook = playbooks[0];
  return {
    ...playbook,
    actions: playbook.actions
      ?.sort((a, b) => a.position - b.position)
      .map(action => ({
        ...action,
        subActions: action.sub_actions?.sort((a, b) => a.position - b.position) || [],
      })) || [],
  };
};

export const getArchivedPlaybooks = async () => {
  const { data: playbooks, error } = await supabase
    .from('playbooks')
    .select('*, actions(*, sub_actions(*))')
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });

  if (error) throw error;

  return playbooks.map(playbook => ({
    ...playbook,
    actions: playbook.actions
      ?.sort((a, b) => a.position - b.position)
      .map(action => ({
        ...action,
        subActions: action.sub_actions?.sort((a, b) => a.position - b.position) || [],
      })) || [],
  }));
};

export const updateAction = async (actionId, updates) => {
  const { error } = await supabase
    .from('actions')
    .update(updates)
    .eq('id', actionId);

  if (error) throw error;
};

export const replaceAction = async (actionId, newActionData, position) => {
  const { error } = await supabase
    .from('actions')
    .update({
      title: newActionData.title,
      description: newActionData.description,
      horizon: newActionData.horizon,
      rationale: newActionData.rationale,
    })
    .eq('id', actionId);

  if (error) throw error;
};

export const saveSubActions = async (actionId, subActions) => {
  const { error: deleteError } = await supabase
    .from('sub_actions')
    .delete()
    .eq('action_id', actionId);

  if (deleteError) throw deleteError;

  if (subActions && subActions.length > 0) {
    const subActionsToInsert = subActions.map((sub, index) => ({
      action_id: actionId,
      id: sub.id,
      title: sub.title,
      is_completed: sub.isCompleted || false,
      position: index,
    }));

    const { error: insertError } = await supabase
      .from('sub_actions')
      .insert(subActionsToInsert);

    if (insertError) throw insertError;
  }
};

export const updateSubAction = async (subActionId, updates) => {
  const { error } = await supabase
    .from('sub_actions')
    .update(updates)
    .eq('id', subActionId);

  if (error) throw error;
};

export const updatePlaybookJournal = async (playbookId, journalEntry) => {
  const { error } = await supabase
    .from('playbooks')
    .update({ journal_entry: journalEntry })
    .eq('id', playbookId);

  if (error) throw error;
};

export const archivePlaybook = async (playbookId) => {
  const { error } = await supabase
    .from('playbooks')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', playbookId);

  if (error) throw error;
};

export const deletePlaybook = async (playbookId) => {
  const { error } = await supabase
    .from('playbooks')
    .delete()
    .eq('id', playbookId);

  if (error) throw error;
};
