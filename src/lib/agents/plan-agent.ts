import { chatCompletion, type ChatMessage } from "@/lib/openrouter";

const SYSTEM_PROMPT = `You are an elite execution planner. A user has a viable idea to make $1,000,000 in 6 months. Your job is to create the most detailed, actionable 180-day plan possible.

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "title": "Roadmap title",
  "summary": "2-3 sentence overview of the strategy",
  "morningStack": [ { "title": "task name", "timeEstimate": "15 min" } ],
  "months": [ { "month": 1, "title": "Month title", "milestone": "What must be true by end of this month" } ],
  "days": {
    "1": [ { "title": "Task title", "description": "Detailed step-by-step description of exactly what to do", "priority": "high", "timeEstimate": "2 hours", "whyItMatters": "How this directly contributes to the $1M goal" } ],
    "2": [ ... ]
  }
}

Rules:
- morningStack: 4-6 recurring daily habits.
- Each day MUST have 2-5 specific, actionable tasks.
- Tasks should escalate in complexity over 180 days.
- Output ONLY the JSON. No markdown fences.`;

export async function generatePlan(idea: string, viabilityContext: string, clientProvider?: string, clientKey?: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Idea: "${idea}"\n\nViability context: ${viabilityContext}\n\nGenerate the complete 180-day roadmap as JSON.` },
  ];

  const raw = await chatCompletion(messages, 16000, clientProvider, clientKey);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Plan agent returned non-JSON response");

  return jsonMatch[0];
}
