// Client-side wrapper to call the Supabase Edge Function for Momentum
// Usage: import { generateTasks } from 'src/services/momentumApi'

const FUNCTION_URL = import.meta.env.VITE_MOMENTUM_FUNCTION_URL;

if (!FUNCTION_URL) {
  // This is fine in local prototyping — we keep a clear error to help config.
  // In production, set VITE_MOMENTUM_FUNCTION_URL to your Supabase function endpoint.
  console.warn('VITE_MOMENTUM_FUNCTION_URL is not set. momentumApi.generateTasks will fail until set.');
}

export async function generateTasks(input) {
  if (!FUNCTION_URL) throw new Error('VITE_MOMENTUM_FUNCTION_URL is not configured');
  const resp = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generate', input }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    const err = data?.error || JSON.stringify(data);
    throw new Error(`Momentum function error: ${err}`);
  }

  if (!data.success) {
    throw new Error(`Momentum function returned failure: ${JSON.stringify(data)}`);
  }

  // The function returns { success: true, result: <parsed|text> }
  return data.result;
}

export async function rerollTask(title, focusArea = '') {
  if (!FUNCTION_URL) throw new Error('VITE_MOMENTUM_FUNCTION_URL is not configured');
  const resp = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reroll', title, focusArea }),
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    const err = data?.error || JSON.stringify(data);
    throw new Error(`Momentum function error: ${err}`);
  }

  return data.result;
}

export async function breakDownTask(title, focusArea = '') {
  if (!FUNCTION_URL) throw new Error('VITE_MOMENTUM_FUNCTION_URL is not configured');
  const resp = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'breakdown', title, focusArea }),
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    const err = data?.error || JSON.stringify(data);
    throw new Error(`Momentum function error: ${err}`);
  }

  return data.result;
}

// Server-backed persistence helpers — these call the Edge Function with the
// user's Supabase access token (pass as `accessToken`). The Edge Function
// verifies the token and performs DB writes using a secure service role key.
export async function saveHistory(payload, accessToken) {
  if (!FUNCTION_URL) throw new Error('VITE_MOMENTUM_FUNCTION_URL is not configured');
  if (!accessToken) throw new Error('saveHistory requires accessToken');
  const resp = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ action: 'saveHistory', payload }),
  });
  const data = await resp.json();
  if (!resp.ok || !data.success) throw new Error(data?.error || JSON.stringify(data));
  return data.result;
}

export async function getHistory(accessToken, limit = 50) {
  if (!FUNCTION_URL) throw new Error('VITE_MOMENTUM_FUNCTION_URL is not configured');
  if (!accessToken) throw new Error('getHistory requires accessToken');
  const resp = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ action: 'getHistory', limit }),
  });
  const data = await resp.json();
  if (!resp.ok || !data.success) throw new Error(data?.error || JSON.stringify(data));
  return data.result;
}

export async function savePlaybook(playbook, accessToken) {
  if (!FUNCTION_URL) throw new Error('VITE_MOMENTUM_FUNCTION_URL is not configured');
  if (!accessToken) throw new Error('savePlaybook requires accessToken');
  const resp = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ action: 'savePlaybook', playbook }),
  });
  const data = await resp.json();
  if (!resp.ok || !data.success) throw new Error(data?.error || JSON.stringify(data));
  return data.result;
}

export async function getPlaybooks(accessToken, limit = 20) {
  if (!FUNCTION_URL) throw new Error('VITE_MOMENTUM_FUNCTION_URL is not configured');
  if (!accessToken) throw new Error('getPlaybooks requires accessToken');
  const resp = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ action: 'getPlaybooks', limit }),
  });
  const data = await resp.json();
  if (!resp.ok || !data.success) throw new Error(data?.error || JSON.stringify(data));
  return data.result;
}

export async function saveJournal(entry, accessToken, playbookId = null) {
  if (!FUNCTION_URL) throw new Error('VITE_MOMENTUM_FUNCTION_URL is not configured');
  if (!accessToken) throw new Error('saveJournal requires accessToken');
  const resp = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ action: 'saveJournal', entry, playbook_id: playbookId }),
  });
  const data = await resp.json();
  if (!resp.ok || !data.success) throw new Error(data?.error || JSON.stringify(data));
  return data.result;
}
