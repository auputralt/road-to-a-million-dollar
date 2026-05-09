# Road to a Million Dollar

AI-powered app that evaluates your startup idea, checks if it can realistically hit **$1M in 6 months**, and if viable — generates a full 180-day execution roadmap.

## Features

- **Viability Check** — AI evaluates your idea against market size, scalability, revenue model, time-to-revenue, and execution complexity
- **Why Not Viable** — If your idea doesn't pass, the AI explains exactly why and suggests similar ideas that do
- **180-Day Roadmap** — Auto-generates daily tasks, milestones, and a morning routine stack
- **Agent Chat** — Plan, audit, resource, and contact agents for ongoing execution support
- **Daily Audits** — Track progress against your plan

## Supported AI Providers

The app works with any of these — just set one API key:

| Provider | Env Key | Get Key |
|----------|---------|---------|
| OpenRouter | `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| Anthropic | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| OpenAI | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| Deepseek | `DEEPSEEK_API_KEY` | [platform.deepseek.com](https://platform.deepseek.com/) |
| Xiaomi | `XIAOMI_API_KEY` | Xiaomi AI platform |

OpenRouter recommended for free tier — routes to free models automatically.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env
# Edit .env and add your API key

# 3. Setup database
npx prisma db push

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

Edit `.env`:

```env
# Pick your provider: openrouter | anthropic | openai | deepseek | xiaomi
# Leave AI_PROVIDER blank to auto-detect from whichever key is set.
AI_PROVIDER=openrouter

# Fill only the key for your chosen provider
OPENROUTER_API_KEY=sk-or-...
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
# DEEPSEEK_API_KEY=sk-...
# XIAOMI_API_KEY=...
```

## How It Works

1. **Submit an idea** — describe your startup concept
2. **AI evaluates** — checks if it can hit $1M in 6 months
3. **Not viable?** — AI explains why and suggests similar viable alternatives. Click one to try again
4. **Viable?** — AI generates a 180-day roadmap with daily tasks
5. **Execute** — use the agent chat and daily audits to stay on track

## Tech Stack

- Next.js 14, TypeScript, Tailwind CSS
- Prisma + SQLite
- Multi-provider AI (OpenRouter / Anthropic / OpenAI / Deepseek / Xiaomi)

## Deploy

Works on Vercel, Railway, or any Node.js host. Set your API keys as environment variables in the deployment dashboard.
