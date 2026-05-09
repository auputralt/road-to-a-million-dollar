// ── Multi-provider AI abstraction ──────────────────────────────────────────
// Supports: OpenRouter, Anthropic, OpenAI, Deepseek, Google Gemini
// Priority: 1) Client-provided key (BYOK)  2) Server env var
// Set AI_PROVIDER in .env to pick which one to use.

export interface AIConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  headers: () => Record<string, string>;
}

export type Provider =
  | "openrouter"
  | "anthropic"
  | "openai"
  | "deepseek"
  | "gemini";

// ── Provider definitions ───────────────────────────────────────────────────

function getOpenRouterConfig(key?: string): AIConfig {
  const apiKey = key || process.env.OPENROUTER_API_KEY || "";
  return {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    model: "openrouter/free",
    maxTokens: 4096,
    headers: () => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000",
      "X-Title": "Road to a Million Dollar",
    }),
  };
}

function getAnthropicConfig(key?: string): AIConfig {
  const apiKey = key || process.env.ANTHROPIC_API_KEY || "";
  return {
    baseURL: "https://api.anthropic.com/v1",
    apiKey,
    model: "claude-sonnet-4-20250514",
    maxTokens: 4096,
    headers: () => ({
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    }),
  };
}

function getOpenAIConfig(key?: string): AIConfig {
  const apiKey = key || process.env.OPENAI_API_KEY || "";
  return {
    baseURL: "https://api.openai.com/v1",
    apiKey,
    model: "gpt-4o-mini",
    maxTokens: 4096,
    headers: () => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  };
}

function getDeepseekConfig(key?: string): AIConfig {
  const apiKey = key || process.env.DEEPSEEK_API_KEY || "";
  return {
    baseURL: "https://api.deepseek.com/v1",
    apiKey,
    model: "deepseek-chat",
    maxTokens: 4096,
    headers: () => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  };
}

function getGeminiConfig(key?: string): AIConfig {
  const apiKey = key || process.env.GEMINI_API_KEY || "";
  return {
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey,
    model: "gemini-2.0-flash",
    maxTokens: 4096,
    headers: () => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  };
}

// ── Resolver ───────────────────────────────────────────────────────────────

const PROVIDERS: Record<Provider, (key?: string) => AIConfig> = {
  openrouter: getOpenRouterConfig,
  anthropic: getAnthropicConfig,
  openai: getOpenAIConfig,
  deepseek: getDeepseekConfig,
  gemini: getGeminiConfig,
};

export function resolveProvider(clientProvider?: string): Provider {
  const env = (clientProvider || process.env.AI_PROVIDER || "").toLowerCase();
  if (env in PROVIDERS) return env as Provider;

  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";

  return "openrouter";
}

// Get AI config — accepts optional client-provided credentials (BYOK)
export function getAIConfig(clientProvider?: string, clientKey?: string): AIConfig {
  const provider = resolveProvider(clientProvider);
  const config = PROVIDERS[provider](clientKey);
  if (!config.apiKey || config.apiKey.includes("your-")) {
    throw new Error(
      `No API key configured. Either:\n` +
      `1. Set your key in Settings (Bring Your Own Key), or\n` +
      `2. Set the server env var for provider "${provider}".\n` +
      `Free option: Get an OpenRouter key at openrouter.ai/keys`
    );
  }
  return config;
}

export function getActiveProvider(): Provider {
  return resolveProvider();
}
