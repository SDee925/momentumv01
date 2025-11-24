# Deploying Momentum (Edge Function + Supabase + Frontend)

This doc lists the minimal steps and environment variables required to deploy Momentum securely.

1) Supabase DB and Auth

- Create a Supabase project and copy the `SUPABASE_URL`.
- In Supabase > Settings > API, copy the `SERVICE_ROLE` key (store it securely; do NOT commit it).

1) Apply DB schema and RLS

- Run the migration `db/migrations/0001_init.sql` against your database (or use Supabase SQL editor to run `db/schema.sql`).
- Enable Row Level Security (RLS) and apply the policies in `db/rls.sql`.

1) Edge Function (server-side LLM proxy + persistence)

- Deploy `functions/momentum/index.ts` as a Supabase Edge Function or any serverless function.
- Required environment variables for the function runtime:
  - `OPENAI_KEY` — Your OpenAI/LLM API key (server-only)
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only)
  - `SUPABASE_URL` — Supabase project URL

Important: The `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_KEY` must never be exposed to the browser. Use your cloud provider's secret management.

1) Frontend deployment

- Set `VITE_MOMENTUM_FUNCTION_URL` to the deployed Edge Function URL.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the frontend deployment environment.

1) How authentication and writes work

- The frontend obtains the user's Supabase session (access token) via `supabase.auth` and calls the Edge Function with `Authorization: Bearer <access_token>`.
- The Edge Function verifies the token with Supabase Auth endpoint and performs DB writes using `SUPABASE_SERVICE_ROLE_KEY` (it bypasses RLS for server operations).

1) Recommended Safety & Production Steps

- Add RLS policies (see `db/rls.sql`).
- Limit service-role key usage to server-only runtimes and rotate keys periodically.
- Add rate-limiting and input validation in the Edge Function to prevent abuse.
- Add CI checks to run lint/tests and deploy using approval workflows.

---
If you'd like, I can create a simple GitHub Actions workflow to deploy the Edge Function and front-end; tell me which provider you want to use (Supabase + Vercel, or Netlify, etc.).
