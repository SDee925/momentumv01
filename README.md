# Momentum

Quick setup and notes for the Momentum v1 workspace.

Overview

- Frontend: React + Vite (+ Tailwind). Entry: `src/main.jsx` → `src/App.jsx`.
- State & orchestration: `src/context/MomentumContext.jsx`.
- LLM proxy: Supabase Edge Function at `functions/momentum/index.ts` (server-side calls to OpenAI).
- Persistence & Auth: Supabase (client + Edge Function-backed writes).

Local development

1. Install dependencies:

```pwsh
npm install
```

1. Start dev server:

```pwsh
npm run dev
```

Environment variables (frontend)

- `VITE_MOMENTUM_FUNCTION_URL` — URL of the deployed Edge Function (or local proxy during dev)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public key (for client SDK)

Edge Function / server-side secrets

- `OPENAI_KEY` — OpenAI (or other LLM) API key (server-only). Set in the Edge Function environment.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only). Required by the Edge Function for writes.
- `SUPABASE_URL` — Supabase URL (used by the function to verify user tokens).

Security note

- NEVER commit `OPENAI_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to source control or front-end env files. The service role key must only be available to server/Edge Function runtime.

Database

- Schema: `db/schema.sql` (tables: `playbooks`, `tasks_history`, `journals`). Run this against your Supabase/Postgres instance.
- Add Row-Level Security (RLS) policies for production to limit access — see `db/schema.sql` and plan RLS rules before deploying.

How persistence works (short)

- The frontend calls `src/services/momentumApi.js` which proxies LLM calls to the Edge Function.
- For writes (save/playbook/journal/history) the client sends the user's Supabase access token to the Edge Function (Authorization: `Bearer <access_token>`). The Edge Function verifies the token using Supabase Auth and performs DB writes using the `SUPABASE_SERVICE_ROLE_KEY`.

Deploy notes

- Deploy the Edge Function (Supabase Edge Functions or your preferred serverless host). Provide `OPENAI_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_URL` as secrets.
- Configure `VITE_MOMENTUM_FUNCTION_URL` in your front-end deployment (Vercel, Netlify, etc.).

Next steps (recommended)

- Add RLS and DB migrations for production.
- Add CI (tests + linting) and a deployment script for functions + frontend.
- Polish per-action sync UI and surface granular sync status for redo/deep-dive actions.

If you want, I can:

- update `src/context/MomentumContext.jsx` to fully use the server-backed `momentumApi` save functions (I can do this next),
- add a short `docs/deploy.md` describing how to set secrets in Supabase and deploy the Edge Function.

---
Last edited: concise maintenance notes included.
