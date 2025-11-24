import { serve } from "std/server";

// Supabase Edge Function template for Momentum: calls the OpenAI/LLM API
// Expects POST body: { action?: 'generate'|'reroll'|'breakdown', input?: string, focusArea?: string, title?: string }
// Requires: OPENAI_KEY set in the function's environment variables

const OPENAI_KEY = Deno.env.get("OPENAI_KEY");

if (!OPENAI_KEY) {
  // If the function is deployed without the secret, respond with helpful message.
  console.warn("WARNING: OPENAI_KEY is not set in environment");
}


function makePromptGenerate(input: string) {
  return `You are Momentum assistant. Given user input, return a JSON object with a top-level field \"actions\" which is an array of tasks. Each task should be an object with keys: id (short unique id), title, description (optional). Respond with valid JSON only. Input: ${input}`;
}

function makePromptReroll(title: string, focusArea = '') {
  return `You are Momentum assistant. The user has an action titled \"${title}\" in focus area \"${focusArea}\". Provide a single improved alternative action title and optional description in JSON: { "title": "...", "description": "..." }`;
}

function makePromptBreakdown(title: string, focusArea = '') {
  return `You are Momentum assistant. Break down the action titled \"${title}\" into a JSON array named \"subActions\" where each subAction has { id, title }. Keep entries concise.`;
}

async function callOpenAI(prompt: string) {
  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 800,
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI error: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  // Try to extract assistant text
  const assistant = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;
  return assistant;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

async function getUserFromToken(token: string | null) {
  if (!token || !SUPABASE_URL) return null;
  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (err) {
    console.warn('Failed to verify user token', err);
    return null;
  }
}

async function supabaseInsert(table: string, record: any) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase service key not configured');
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify([record]),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Supabase insert error: ${resp.status} ${JSON.stringify(data)}`);
  return data?.[0] ?? null;
}

async function supabaseSelect(table: string, filter: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase service key not configured');
  const url = `${SUPABASE_URL}/rest/v1/${table}?${filter}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Supabase select error: ${resp.status} ${JSON.stringify(data)}`);
  return data;
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const bodyJson = await req.json().catch(() => ({}));
    const { action = 'generate', input, focusArea, title, payload, playbook, entry, limit = 50 } = bodyJson;
    const authHeader = req.headers.get('Authorization');
    const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

    if (!OPENAI_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured: OPENAI_KEY missing" }), { status: 500 });
    }

    let prompt = '';
    if (action === 'generate') {
      if (!input || typeof input !== 'string') {
        return new Response(JSON.stringify({ error: "Invalid request: 'input' is required for generate" }), { status: 400 });
      }
      prompt = makePromptGenerate(input);
    } else if (action === 'reroll') {
      if (!title || typeof title !== 'string') {
        return new Response(JSON.stringify({ error: "Invalid request: 'title' is required for reroll" }), { status: 400 });
      }
      prompt = makePromptReroll(title, focusArea);
    } else if (action === 'breakdown') {
      if (!title || typeof title !== 'string') {
        return new Response(JSON.stringify({ error: "Invalid request: 'title' is required for breakdown" }), { status: 400 });
      }
      prompt = makePromptBreakdown(title, focusArea);
    } else if (action === 'saveHistory') {
      // payload expected: { entries: [...] }
      const user = await getUserFromToken(bearer);
      if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      if (!payload) return new Response(JSON.stringify({ error: "Invalid request: 'payload' is required for saveHistory" }), { status: 400 });
      const record = { user_id: user?.id, payload };
      const inserted = await supabaseInsert('tasks_history', record);
      return new Response(JSON.stringify({ success: true, result: inserted }), { headers: { 'Content-Type': 'application/json' } });
    } else if (action === 'savePlaybook') {
      const user = await getUserFromToken(bearer);
      if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      if (!playbook) return new Response(JSON.stringify({ error: "Invalid request: 'playbook' is required for savePlaybook" }), { status: 400 });
      const record = { user_id: user?.id, title: playbook.title || null, focus_area: playbook.focusArea || null, payload: playbook };
      const inserted = await supabaseInsert('playbooks', record);
      return new Response(JSON.stringify({ success: true, result: inserted }), { headers: { 'Content-Type': 'application/json' } });
    } else if (action === 'saveJournal') {
      const user = await getUserFromToken(bearer);
      if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      if (!entry) return new Response(JSON.stringify({ error: "Invalid request: 'entry' is required for saveJournal" }), { status: 400 });
      const record = { user_id: user?.id, entry, playbook_id: bodyJson.playbook_id ?? null };
      const inserted = await supabaseInsert('journals', record);
      return new Response(JSON.stringify({ success: true, result: inserted }), { headers: { 'Content-Type': 'application/json' } });
    } else if (action === 'getHistory') {
      const user = await getUserFromToken(bearer);
      if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      const rows = await supabaseSelect('tasks_history', `user_id=eq.${user.id}&order=created_at.desc&limit=${limit}`);
      return new Response(JSON.stringify({ success: true, result: rows }), { headers: { 'Content-Type': 'application/json' } });
    } else if (action === 'getPlaybooks') {
      const user = await getUserFromToken(bearer);
      if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      const rows = await supabaseSelect('playbooks', `user_id=eq.${user.id}&order=created_at.desc&limit=${limit}`);
      return new Response(JSON.stringify({ success: true, result: rows }), { headers: { 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    }

    const assistantText = await callOpenAI(prompt);

    // Attempt to parse JSON out of the assistant response; fall back to raw text
    let parsed = null;
    try {
      const jsonMatch = assistantText && assistantText.match ? assistantText.match(/\{[\s\S]*\}|\[[\s\S]*\]/) : null;
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(assistantText);
    } catch (err) {
      parsed = { text: assistantText };
    }

    return new Response(JSON.stringify({ success: true, result: parsed }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
