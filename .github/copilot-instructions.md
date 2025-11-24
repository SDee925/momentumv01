# Copilot / AI Agent Instructions — Momentum v1

This file provides concise, repo-specific guidance for AI assistants and contributors.

1. Project overview
- Framework: React (JSX) + Vite. Entry: `src/main.jsx` → `src/App.jsx`.
- Core state: `src/context/MomentumContext.jsx` (playbooks, API key, active task, history).

2. Common commands
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`

3. Important files
- UI components: `src/components/` (PascalCase `.jsx`).
- LLM service (client-side): `src/services/openrouter.js` (currently used; prefer moving server-side).
- Context and persistence: `src/context/MomentumContext.jsx`.

4. Security & secrets
- Never commit API keys or secrets. Use environment variables for CI and server functions.
- Move all OpenAI/OpenRouter calls to server-side endpoints (Edge Functions, Serverless). Client should never hold server API keys.

5. Contribution notes
- Keep changes focused and minimal. Follow existing code style and Tailwind/JSX conventions.
- When adding features that require secrets (OpenAI, Stripe), add `.env.example` and document required vars in `README.md`.

6. If you need help
- Read `README.md` and `docs/` for product context.
- For backend/auth recommendations, see `docs/prd.md` or ask the repo maintainer.

This file is intentionally concise — expand only with small, reviewable guidelines.
