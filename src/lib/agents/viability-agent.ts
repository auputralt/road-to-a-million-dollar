import { chatCompletion, type ChatMessage } from "@/lib/openrouter";

const SYSTEM_PROMPT = `You are a ruthless but fair startup viability evaluator.
Your only job: decide if an idea can realistically generate $1,000,000 in revenue within 6 months.

Evaluation criteria:
1. Market size — Is the addressable market large enough?
2. Scalability — Can this scale without linear cost increase?
3. Revenue model — Is there a clear, proven path to revenue?
4. Time-to-revenue — Can money start flowing within weeks, not months?
5. Execution complexity — Can one person with AI tools execute this?

You MUST respond with ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "viable": true or false,
  "reasoning": "2-3 sentence explanation",
  "estimatedRevenuePotential": "e.g. $50K-$200K or $500K-$1M+",
  "keyRisks": ["risk1", "risk2", "risk3"],
  "suggestedApproach": "one sentence on the best angle",
  "notViableReason": "ONLY if viable=false — detailed explanation of WHY this won't hit $1M in 6 months. Be specific about which criteria failed and what the core blocker is.",
  "alternatives": "ONLY if viable=false — suggest 2-3 SIMILAR ideas that address the same market/problem but ARE viable for $1M in 6 months. Format as array of objects with 'idea' and 'whyViable' fields. Example: [{\"idea\": \"...\", \"whyViable\": \"...\"}]"
}`;

export interface ViabilityResult {
  viable: boolean;
  reasoning: string;
  estimatedRevenuePotential: string;
  keyRisks: string[];
  suggestedApproach: string;
  notViableReason: string;
  alternatives: { idea: string; whyViable: string }[];
}

export async function evaluateViability(idea: string, clientProvider?: string, clientKey?: string): Promise<ViabilityResult> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Evaluate this idea for $1M in 6 months:\n\n"${idea}"` },
  ];

  const raw = await chatCompletion(messages, undefined, clientProvider, clientKey);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Viability agent returned non-JSON response");

  const result = JSON.parse(jsonMatch[0]);
  return {
    viable: Boolean(result.viable),
    reasoning: String(result.reasoning ?? ""),
    estimatedRevenuePotential: String(result.estimatedRevenuePotential ?? "Unknown"),
    keyRisks: Array.isArray(result.keyRisks) ? result.keyRisks : [],
    suggestedApproach: String(result.suggestedApproach ?? ""),
    notViableReason: String(result.notViableReason ?? ""),
    alternatives: Array.isArray(result.alternatives) ? result.alternatives : [],
  };
}
