import { NextRequest, NextResponse } from "next/server";
import { chatCompletionStream, type ChatMessage } from "@/lib/openrouter";
import { getContactRecommendation } from "@/lib/agents/contact-agent";
import { getResourceRecommendations } from "@/lib/agents/resource-agent";
import { prisma } from "@/lib/prisma";
import { getDayNumber, parseRoadmap } from "@/lib/roadmap-utils";

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  plan: `You are the Plan Agent. Help manage and update the user's 180-day roadmap.`,
  audit: `You are the Audit Agent. Run daily check-ins and provide progress assessments.`,
  contact: `You are the Contact Agent. Help manage outreach and relationships.`,
  resource: `You are the Resource Agent. Recommend books, tools, courses, and communities.`,
};

async function buildProjectContext(projectId: string): Promise<string> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: { orderBy: [{ dayNumber: "asc" }, { priority: "asc" }] },
      audits: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });
  if (!project) return "";

  const dayNumber = getDayNumber(project.createdAt);
  const roadmap = parseRoadmap(project.roadmap);
  const currentMonth = roadmap.months.find((m) => m.month === Math.min(6, Math.ceil(dayNumber / 30)));

  const thisWeekTasks = project.tasks.filter((t) => t.dayNumber >= dayNumber && t.dayNumber <= dayNumber + 6);
  const todayTasks = project.tasks.filter((t) => t.dayNumber === dayNumber);
  const latestAudit = project.audits[0];

  const completedToday = todayTasks.filter((t) => t.completed).length;
  const totalToday = todayTasks.length;

  return `
=== PROJECT CONTEXT ===
Project: ${project.name}
Idea: ${project.idea}
Status: ${project.status}
Current Day: ${dayNumber} of 180
Current Month: ${currentMonth ? `Month ${currentMonth.month} — ${currentMonth.milestone}` : "Unknown"}

=== TODAY'S TASKS (${completedToday}/${totalToday} completed) ===
${todayTasks.map((t) => `- [${t.completed ? "x" : " "}] ${t.title} (${t.priority} priority, ~${t.timeEstimate})`).join("\n") || "No tasks assigned for today."}

=== THIS WEEK'S UPCOMING ===
${thisWeekTasks.filter((t) => t.dayNumber > dayNumber).slice(0, 5).map((t) => `- Day ${t.dayNumber}: ${t.title}`).join("\n") || "No upcoming tasks this week."}

=== LATEST AUDIT (Day ${latestAudit?.dayNumber ?? "none"}) ===
${latestAudit ? `User: ${latestAudit.userInput.slice(0, 200)}\nAI: ${latestAudit.aiResponse.slice(0, 200)}` : "No audits yet."}

=== ROADMAP SUMMARY ===
${roadmap.summary}
=== END CONTEXT ===
`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { agent, message, projectId } = await req.json();
    if (!agent || !AGENT_SYSTEM_PROMPTS[agent]) return NextResponse.json({ error: "Unknown agent" }, { status: 400 });

    const clientProvider = req.headers.get("x-ai-provider") || undefined;
    const clientKey = req.headers.get("x-ai-key") || undefined;

    if (agent === "contact") {
      const contacts = await prisma.contact.findMany({ orderBy: { lastContacted: "asc" }, take: 50 });
      const result = await getContactRecommendation(message, contacts, clientProvider, clientKey);

      if (projectId) logAgentAction(projectId, "contact", "chat", result.slice(0, 200));
      return streamText(result);
    }

    if (agent === "resource") {
      let sprintFocus = "General entrepreneurship";
      if (projectId) {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (project) sprintFocus = project.name;
      }
      const result = await getResourceRecommendations(message, sprintFocus, clientProvider, clientKey);

      if (projectId) logAgentAction(projectId, "resource", "chat", result.slice(0, 200));
      return streamText(result);
    }

    let systemPrompt = AGENT_SYSTEM_PROMPTS[agent];
    if (projectId) {
      const ctx = await buildProjectContext(projectId);
      if (ctx) systemPrompt += `\n\n${ctx}`;
    }

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];
    const stream = await chatCompletionStream(messages, clientProvider, clientKey);

    if (projectId) logAgentAction(projectId, agent, "chat", message.slice(0, 200));

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Agent chat failed" }, { status: 500 });
  }
}

function logAgentAction(projectId: string, agentType: string, action: string, summary: string) {
  prisma.agentAction.create({ data: { projectId, agentType, action, summary } }).catch(() => {});
}

function streamText(text: string) {
  return new Response(
    new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const words = text.split(" ");
        let i = 0;
        const interval = setInterval(() => {
          if (i >= words.length) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            clearInterval(interval);
            return;
          }
          const chunk = words.slice(i, i + 3).join(" ") + " ";
          const sse = `data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`;
          controller.enqueue(encoder.encode(sse));
          i += 3;
        }, 30);
      },
    }),
    { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
  );
}
