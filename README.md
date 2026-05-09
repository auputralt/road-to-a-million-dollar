# Road to a Million Dollar

AI-powered app that evaluates your startup idea, checks if it can realistically hit **$1M in 6 months**, and if viable — generates a full 180-day execution roadmap.

**Live**: [road-to-a-million.vercel.app](https://road-to-a-million.vercel.app)

![Road to a Million Dollar Screenshot](public/screenshot.jpg)

## Features

- **Idea Submission** — Describe your startup concept and let AI evaluate it instantly
- **Viability Check** — AI evaluates your idea against market size, scalability, revenue model, time-to-revenue, and execution complexity
- **Why Not Viable** — If your idea doesn't pass, the AI explains exactly why and suggests similar ideas that do
- **180-Day Roadmap** — Auto-generates daily tasks, milestones, and a morning routine stack
- **Dashboard** — Track project progress with task completion, daily plans, and morning stack
- **Agent Chat** — Plan, audit, resource, and contact agents for ongoing execution support
- **Daily Audits** — Track progress against your plan with end-of-day reflections
- **Timeline View** — Visualize your 180-day journey across weeks and months
- **Project Management** — Create, track, and delete projects with full cascade cleanup

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
# Edit .env — add your AI API key and Turso database URL

# 3. Setup database (local SQLite for dev)
npx prisma db push

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

Edit `.env`:

```env
# Database — Turso (libSQL) for production, local SQLite for dev
DATABASE_URL="libsql://your-db-name-your-org.aws-ap-northeast-1.turso.io"
DATABASE_AUTH_TOKEN="your-turso-auth-token"

# Pick your provider: openrouter | anthropic | openai | deepseek | xiaomi
AI_PROVIDER=openrouter

# Fill only the key for your chosen provider
OPENROUTER_API_KEY=sk-or-...
```

## How It Works

1. **Submit an idea** — describe your startup concept
2. **AI evaluates** — checks if it can hit $1M in 6 months
3. **Not viable?** — AI explains why and suggests similar viable alternatives. Click one to try again
4. **Viable?** — AI generates a 180-day roadmap with daily tasks
5. **Execute** — use the agent chat and daily audits to stay on track

## Tech Stack

- **Framework**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Turso (libSQL) via Prisma with driver adapters
- **AI**: Multi-provider (OpenRouter / Anthropic / OpenAI / Deepseek / Xiaomi)
- **Deployment**: Vercel

## Deploy on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Link and deploy
vercel link
vercel --prod
```

Set these environment variables in Vercel dashboard or CLI:

- `DATABASE_URL` — Turso connection string
- `DATABASE_AUTH_TOKEN` — Turso auth token
- `AI_PROVIDER` — your chosen provider
- Your API key (e.g. `OPENROUTER_API_KEY`)
