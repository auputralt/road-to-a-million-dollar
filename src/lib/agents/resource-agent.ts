import { chatCompletion, type ChatMessage } from "@/lib/openrouter";

const SYSTEM_PROMPT = `You are a resource recommendation engine for entrepreneurs.
Given a task or sprint focus, recommend the most useful resources (books, videos, tools). Format as a numbered list with direct links if possible.`;

export async function getResourceRecommendations(taskContext: string, sprintFocus: string, clientProvider?: string, clientKey?: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Current sprint focus: ${sprintFocus}\n\nTask context: ${taskContext}\n\nRecommend the best resources to accelerate progress.` },
  ];
  return chatCompletion(messages, undefined, clientProvider, clientKey);
}
