Product Requirements Document (PRD)
Project: The Momentum Engine (MVP) Version: 1.0 Status: Draft Core Philosophy: "Action over
Planning. Ruthless Compassion."
1. Problem Statement
The User's Struggle: Users suffer from "Analysis Paralysis." They have vague goals ("Get fit," "Start a
business") but are stopped by high Activation Energy. They do not need more "suggestions"; they need
a structured, imperative protocol to break inertia. The Opportunity: Existing tools are passive (to-do
lists). There is a gap for an active tool that takes a single input and generates a psychometrically valid
"ramp" of action, moving from micro-steps to identity shifts.
2. Target Audience
1. The Stalled Creator: Wants to build a channel/blog but is stuck on "perfectionism."
2. The Over-Thinker: Researches tools endlessly instead of doing the work.
3. The "Roast" Viewer (Growth Strategy): Social media users who want to see their vague excuses
dismantled by AI (Entertainment value).
3. MVP Scope (The "Must Haves")
The MVP focuses solely on the "Input -> Analysis -> Action" loop.
In Scope Out of Scope (Post-MVP)
Single-word input processing Multi-user collaboration
AI-generated "Momentum Map" (JSON) Native Mobile App (iOS/Android)
"Opinionated" Task Generation Calendar Integrations (Google/Outlook)
"Reroll" Task Functionality Complex Gamification (XP/Levels)
3-Horizon View (Immediate/Medium/Long) Paid Subscription Tiers
Basic Local Persistence (Save 1 Plan) Email Notifications
4. Functional Requirements
4.1 The Spark Input
FR 1.1: User must be able to input a text string (1-5 words).
11/21/25, 7:53 AM Google Gemini
https://gemini.google.com/app/4b0628158c984b3e 1/3
FR 1.2: System must strictly enforce a "Loading State" that communicates "Analyzing Friction
Points" (Psychological priming).
4.2 The Engine (AI Integration)
FR 2.1: System must query the LLM (Gemini) using the refined_prompt_strategy.md .
FR 2.2: Output must be strictly JSON schema validation. If JSON fails, system acts as a fallback
and requests regeneration automatically.
FR 2.3: The "Analysis" field must contain a "Roast" element—identifying the specific type of
procrastination (e.g., "Productive Procrastination").
4.3 The Dashboard (The Interface)
FR 3.1: Display the "Momentum Map" in three distinct tabs or columns: Immediate, Medium, Long.
FR 3.2: Immediate Actions must be rendered with a visual "Start" trigger (e.g., a checkbox or a
'Start Timer' button).
FR 3.3: Visual Progress Bar ("Momentum Velocity") must update immediately upon checking an
item (Instant Dopamine).
4.4 The Reroll Logic (Critical)
FR 4.1: Each actionable card must have a "Refuse/Reroll" option.
FR 4.2: Clicking Reroll triggers the secondary API call defined in refined_prompt_strategy.md
(Section 3).
FR 4.3: The new task must replace the old one in the UI with a distinct animation to show
"Constraint adjustment."
4.5 The Content Loop (Growth Feature)
FR 5.1: "Share Analysis" button.
FR 5.2: Generates a clean, high-contrast image of the "Focus Area + Roast + Top 3 Immediate
Actions" suitable for Instagram Stories/TikTok Greenscreen.
5. User Stories
1. As a user, I want to type "Writing" and receive a plan that tells me to "Write 5 bad sentences" so
that I can stop worrying about writing a perfect chapter.
2. As a user, I want to "Reroll" a task that feels physically impossible right now, so that I can get a
task that is easier but still moves me forward.
3. As a user, I want to see a visual representation of my momentum increasing, so that I feel the
reward of the action immediately.
4. As a content creator (You), I want to input a subscriber's problem and get a "brutal" truth bomb
analysis, so I can screen-record it for a Short.
11/21/25, 7:53 AM Google Gemini
https://gemini.google.com/app/4b0628158c984b3e 2/3
6. Technical Architecture
Frontend: React + Tailwind CSS (Fast iteration, responsive).
State Management: React Context or Zustand (Manage the JSON playbook state).
Backend/API: Firebase Functions (to hide the API key and manage rate limits).
AI Model: Gemini 1.5 Flash (Low latency is critical for the "Instant" feel).
7. Success Metrics (KPIs)
Activation Rate: % of users who check off at least ONE "Immediate Action" box within 60
seconds of generation.
Reroll Utility: % of users who accept the second (rerolled) task (Indicates the "Negotiation"
feature is working).
Share Rate: % of users who click "Share Analysis" (Direct proxy for organic growth).
8. Risks & Mitigations
Risk: AI Hallucination (Suggesting dangerous or nonsensical tasks).
Mitigation: Prompt constraints explicitly banning dangerous keywords; Disclaimer in footer.
Risk: API Latency (User leaves before plan generates).
Mitigation: Engaging "Skeleton Loader" UI that displays "Psychological tips" while waiting.
11/21/25, 7:53 AM Google Gemini
https://gemini.google.com/app/4b0628158c984b3e 3/3