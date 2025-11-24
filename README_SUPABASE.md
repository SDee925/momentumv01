# Supabase Momentum Flow - Setup Guide

This document describes the new Supabase-backed Momentum flow that provides a secure server-side OpenAI integration.

## Overview

The Supabase Momentum flow consists of:
- **Edge Function**: Server-side OpenAI integration for security
- **Client Services**: API helpers and response parsers
- **UI Components**: MomentumUI (main flow) and FocusMode (Pomodoro timer)
- **Database Schema**: Optional tasks history persistence

## Setup Instructions

### 1. Configure Supabase

Create a Supabase project at [supabase.com](https://supabase.com) if you haven't already.

### 2. Set Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Deploy the Edge Function

Install the Supabase CLI:
```bash
npm install -g supabase
```

Login and link your project:
```bash
supabase login
supabase link --project-ref your-project-ref
```

Deploy the momentum Edge Function:
```bash
supabase functions deploy momentum
```

### 4. Set the OpenAI Secret

Set your OpenAI API key as a secret in Supabase:
```bash
supabase secrets set OPENAI_KEY=your-openai-api-key
```

Or through the Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add a new secret: `OPENAI_KEY` with your OpenAI API key

### 5. (Optional) Set Up Database Persistence

Run the SQL schema in your Supabase SQL Editor:
```bash
supabase db push
```

Or manually run the contents of `db/schema.sql` in the Supabase SQL Editor.

## Architecture

### Edge Function (`functions/momentum/index.ts`)
- Accepts POST requests with `{ input: string }`
- Reads `OPENAI_KEY` from Supabase secrets
- Calls OpenAI API with gpt-4o-mini model
- Returns structured JSON: `{ roast, tasks, deep_dive_template }`
- Validates response structure before returning

### Client Services

#### `src/services/momentumApi.js`
- Initializes Supabase client
- Exports `fetchMomentumFromServer(input)` to invoke the Edge Function
- Handles errors and returns data

#### `src/services/responseParser.js`
- Validates momentum response structure
- Ensures tasks array has exactly 3 items
- Validates task fields (title, description, estimated_minutes)

#### `src/promptTemplates.js`
- Provides `buildDeepDivePrompt(task)` for breaking down tasks
- Returns formatted prompt for AI

### UI Components

#### `src/components/MomentumUI.jsx`
Main momentum flow component:
- Input field for user goals
- Displays roast and 3 task cards
- Action buttons: Start Focus, Redo, Deep Dive
- Manages state for loading, errors, and responses

#### `src/components/FocusMode.jsx`
Pomodoro-style focus timer:
- Fullscreen focus view
- Circular progress timer
- Pause/Resume/Done/Exit controls
- Auto-completes when time runs out

## Usage

Once configured, the app will show the MomentumUI by default. Users can:

1. Enter what they want to accomplish
2. Click "Generate Momentum Plan"
3. View their personalized roast and 3 tasks
4. Click "Start Focus" on any task to enter focus mode
5. Use the Pomodoro timer to work through the task

## Database Schema

The optional `tasks_history` table stores:
- User ID (linked to auth.users)
- Input text
- Full JSON response
- Completion status
- Timestamps

Row Level Security (RLS) policies ensure users only see their own history.

## API Response Format

The Edge Function returns:
```json
{
  "roast": "Motivating message to get user started",
  "tasks": [
    {
      "title": "Task title",
      "description": "What to do",
      "estimated_minutes": 30
    }
  ],
  "deep_dive_template": "Template for task breakdown"
}
```

## Error Handling

The system includes comprehensive error handling:
- Missing Supabase configuration
- Invalid input
- OpenAI API errors
- JSON parsing failures
- Schema validation errors

All errors are displayed to users with clear messages.

## Development

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Testing

The implementation includes:
- Input validation
- Response parsing validation
- Error state handling
- Loading states
- Timer functionality

## Future Enhancements

Placeholder functionality for:
- **Redo**: Regenerate individual tasks
- **Deep Dive**: Break tasks into sub-steps
- **History**: Persist and retrieve past momentum plans
