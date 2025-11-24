// Supabase Edge Function for Momentum AI integration
// This function securely calls OpenAI API server-side

// Import Deno's serve function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MomentumRequest {
  input: string;
}

interface MomentumResponse {
  roast: string;
  tasks: Array<{
    title: string;
    description: string;
    estimated_minutes: number;
  }>;
  deep_dive_template: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key from environment
    const OPENAI_KEY = Deno.env.get('OPENAI_KEY');
    if (!OPENAI_KEY) {
      console.error('OPENAI_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { input }: MomentumRequest = await req.json();
    
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Input is required and must be a non-empty string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt for OpenAI
    const systemPrompt = `You are a productivity assistant that helps people build momentum. 
Given a short phrase describing what someone wants to accomplish, you will:
1. Give them a motivating (sometimes playful/snarky) roast to get them moving
2. Break down their goal into exactly 3 actionable tasks
3. Provide a template for deeper exploration

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{
  "roast": "A short, motivating message (1-2 sentences)",
  "tasks": [
    {
      "title": "Task 1 title",
      "description": "Brief description of what to do",
      "estimated_minutes": 30
    },
    {
      "title": "Task 2 title", 
      "description": "Brief description of what to do",
      "estimated_minutes": 45
    },
    {
      "title": "Task 3 title",
      "description": "Brief description of what to do", 
      "estimated_minutes": 20
    }
  ],
  "deep_dive_template": "A template prompt for breaking down tasks further"
}

Do not include any markdown formatting, explanations, or text outside the JSON object.`;

    const userPrompt = `Help me build momentum on: ${input}`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error', details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    
    // Extract the assistant's message
    const assistantMessage = openaiData.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      return new Response(
        JSON.stringify({ error: 'No response from AI service' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let parsedResponse: MomentumResponse;
    try {
      parsedResponse = JSON.parse(assistantMessage);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', assistantMessage);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response format from AI',
          raw_content: assistantMessage 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the response structure
    if (
      !parsedResponse.roast ||
      !Array.isArray(parsedResponse.tasks) ||
      parsedResponse.tasks.length !== 3 ||
      !parsedResponse.deep_dive_template
    ) {
      console.error('Invalid response structure:', parsedResponse);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response structure from AI',
          raw_content: assistantMessage 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each task has required fields
    for (const task of parsedResponse.tasks) {
      if (!task.title || !task.description || typeof task.estimated_minutes !== 'number') {
        console.error('Invalid task structure:', task);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid task structure from AI',
            raw_content: assistantMessage 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Return the validated response
    return new Response(
      JSON.stringify(parsedResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
