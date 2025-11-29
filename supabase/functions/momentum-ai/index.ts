import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.77.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MOMENTUM_PROMPT = `
You are The Momentum Architect. You are not a passive coach; you are a strategist for high-friction scenarios. Your user is stuck in a loop of overthinking and inaction. Your job is to break that loop with "Ruthless Compassion." You do not offer suggestions; you prescribe protocols. You prioritize movement over comfort, and action over planning. Your tone is direct, authoritative, and devoid of fluff.

Constraints:
- No "Polite Hedging": Never use phrases like "You might want to," "Consider trying," or "It could be helpful to." Use imperative verbs: "Do this," "Write this," "Set this."
- The "Anti-Generic" Firewall: explicitly FORBID generic advice unless chemically necessary.
- Banned Suggestions: "Drink more water," "Meditate," "Journal your feelings," "Take a deep breath."
- Required Alternative: Focus on mechanical, physical actions. Instead of "Meditate," say "Sit in a chair and stare at the wall for 3 minutes with no phone."
- The "Pain Point" Callout: Before giving the plan, briefly "roast" the specific type of procrastination the user is displaying.

CRITICAL: You must output the response in strict JSON format. Do not include markdown formatting (like \`\`\`json) around the output. The output must parse directly into this structure:

{
  "focusArea": "String",
  "analysis": "String (The roast/analysis)",
  "opportunities": {
    "internal": "String",
    "external": "String",
    "hidden": "String"
  },
  "actions": [
    {
      "id": "String (unique id)",
      "title": "String (Short, punchy name)",
      "description": "String (The specific directive)",
      "horizon": "immediate",
      "rationale": "String (Why this specific task breaks inertia)"
    },
    {
      "id": "String (unique id)",
      "title": "String",
      "description": "String",
      "horizon": "medium",
      "rationale": "String"
    },
    {
      "id": "String (unique id)",
      "title": "String",
      "description": "String",
      "horizon": "long",
      "rationale": "String"
    }
    // ... generate 3 immediate, 2 medium, 1 long
  ],
  "pitfalls": [
    { "title": "String", "desc": "String" }
  ]
}
`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { action, focusArea, rejectedTaskTitle, parentTask } = await req.json();

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    });

    let result;

    switch (action) {
      case "generate": {
        const completion = await openai.chat.completions.create({
          model: "google/gemma-3n-e4b-it",
          messages: [
            { role: "system", content: MOMENTUM_PROMPT },
            { role: "user", content: `User Focus Area: "${focusArea}"` },
          ],
          response_format: { type: "json_object" },
        });
        result = JSON.parse(completion.choices[0].message.content);
        break;
      }

      case "reroll": {
        const prompt = `
          The user has rejected the task '${rejectedTaskTitle}'. They are resisting it.
          Focus Area: '${focusArea}'
          Task: Generate 1 new 'Immediate Action'.
          Constraint: The new task must be easier to start but equal in impact. It must be a completely different psychological approach than the rejected task.
          Output: JSON format matching a single action object only:
          {
            "id": "String (unique id)",
            "title": "String (Short, punchy name)",
            "description": "String (The specific directive)",
            "horizon": "immediate",
            "rationale": "String (Why this specific task breaks inertia)"
          }
          Do not include markdown formatting.
        `;
        const completion = await openai.chat.completions.create({
          model: "google/gemma-3n-e4b-it",
          messages: [
            { role: "system", content: "You are a helpful assistant that outputs JSON." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });
        result = JSON.parse(completion.choices[0].message.content);
        break;
      }

      case "breakdown": {
        const prompt = `
          The user is stuck on the task: "${parentTask}".
          Focus Area: "${focusArea}"
          
          Goal: Break this task down into 3-5 atomic, micro-steps.
          Constraint: Steps must be extremely granular and mechanical (e.g., "Open Laptop", "Type Title").
          
          Output: JSON format matching an array of objects:
          [
            {
              "id": "String (unique id)",
              "title": "String (Short instruction)"
            }
          ]
          Do not include markdown formatting.
        `;
        const completion = await openai.chat.completions.create({
          model: "google/gemma-3n-e4b-it",
          messages: [
            { role: "system", content: "You are a helpful assistant that outputs JSON." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });
        const parsed = JSON.parse(completion.choices[0].message.content);
        result = Array.isArray(parsed) ? parsed : (parsed.steps || parsed.actions || []);
        break;
      }

      default:
        throw new Error("Invalid action type");
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
