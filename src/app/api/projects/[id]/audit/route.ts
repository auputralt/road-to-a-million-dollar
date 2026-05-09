import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuditStream } from "@/lib/agents";
import { getDayNumber } from "@/lib/roadmap-utils";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const audits = await prisma.auditLog.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json(audits);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userInput, plan } = await req.json();
    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json({ error: "Please provide your daily report." }, { status: 400 });
    }

    // BYOK: extract client-provided credentials
    const clientProvider = req.headers.get("x-ai-provider") || undefined;
    const clientKey = req.headers.get("x-ai-key") || undefined;

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const dayNumber = getDayNumber(project.createdAt);
    const todayTasks = await prisma.dailyTask.findMany({ where: { projectId: params.id, dayNumber } });
    const taskSummary = todayTasks.map(t => `- [${t.completed ? "x" : " "}] ${t.title} (${t.priority})`).join("\n");

    const recentAudits = await prisma.auditLog.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    const auditContext = recentAudits.map(a => `Day ${a.dayNumber}: User said "${a.userInput.slice(0, 100)}..."`).join("\n");

    const stream = await getAuditStream(params.id, dayNumber, taskSummary, userInput, auditContext, plan || "", clientProvider, clientKey);
    const [clientStream, saveStream] = stream.tee();

    const reader = saveStream.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) fullResponse += content;
              } catch {}
            }
          }
        }
      } catch {}
      if (fullResponse) {
        await prisma.auditLog.create({
          data: { projectId: params.id, dayNumber, userInput, aiResponse: fullResponse },
        });
      }
    })();

    return new Response(clientStream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Audit failed" }, { status: 500 });
  }
}
