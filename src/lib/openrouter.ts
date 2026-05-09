// AI chat completion — auto-routes to whatever provider is configured

import { getAIConfig } from "./ai-provider";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  maxTokens?: number,
  clientProvider?: string,
  clientKey?: string
): Promise<string> {
  const ai = getAIConfig(clientProvider, clientKey);

  const hdrs = ai.headers();
  if ("anthropic-version" in hdrs) {
    return anthropicCompletion(ai, messages, maxTokens);
  }

  const res = await fetch(`${ai.baseURL}/chat/completions`, {
    method: "POST",
    headers: ai.headers(),
    body: JSON.stringify({
      model: ai.model,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens ?? ai.maxTokens,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

async function anthropicCompletion(
  ai: ReturnType<typeof getAIConfig>,
  messages: ChatMessage[],
  maxTokens?: number
): Promise<string> {
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const nonSystem = messages.filter((m) => m.role !== "system");

  const res = await fetch(`${ai.baseURL}/messages`, {
    method: "POST",
    headers: ai.headers(),
    body: JSON.stringify({
      model: ai.model,
      system,
      messages: nonSystem,
      max_tokens: maxTokens ?? ai.maxTokens,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json.content?.[0]?.text ?? "";
}

export async function chatCompletionStream(
  messages: ChatMessage[],
  clientProvider?: string,
  clientKey?: string
): Promise<ReadableStream<Uint8Array>> {
  const ai = getAIConfig(clientProvider, clientKey);

  const res = await fetch(`${ai.baseURL}/chat/completions`, {
    method: "POST",
    headers: ai.headers(),
    body: JSON.stringify({
      model: ai.model,
      messages,
      temperature: 0.7,
      max_tokens: ai.maxTokens,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text();
    throw new Error(`AI ${res.status}: ${body}`);
  }

  return res.body;
}
