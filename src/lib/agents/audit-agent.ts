import { chatCompletionStream, type ChatMessage } from "@/lib/openrouter";

const SYSTEM_PROMPT = `You are a focused daily execution coach for someone on a 180-day sprint toward $1,000,000.
1. Compare what they planned vs what they actually did.
2. Identify blockers and suggest concrete next steps.
3. If they fell behind, recalibrate — be specific about what to do tomorrow.
4. If on track, reinforce momentum.
5. Keep it short — 150 words max. No fluff.
Tone: Direct, strategic, supportive. Think executive coach.`;

export function getAuditStream(
  projectId: string,
  dayNumber: number,
  todayTasks: string,
  userInput: string,
  recentAudits: string,
  todaysPlan: string,
  clientProvider?: string,
  clientKey?: string
) {
  const planSection = todaysPlan ? `\n\nToday's plan was:\n"${todaysPlan}"` : "";
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Project: ${projectId}\nDay ${dayNumber} of 180.\n\nToday's tasks:\n${todayTasks}${planSection}\n\nWhat they actually did:\n"${userInput}"\n\n${recentAudits ? `Recent context:\n${recentAudits}` : ""}\n\nCoach them.` },
  ];
  return chatCompletionStream(messages, clientProvider, clientKey);
}
