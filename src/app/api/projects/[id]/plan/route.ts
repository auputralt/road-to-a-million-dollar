import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePlan } from "@/lib/agents";
import { parseRoadmap, getMonthNumber, getWeekNumber } from "@/lib/roadmap-utils";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (!project.viable) return NextResponse.json({ error: "Cannot generate plan for non-viable project" }, { status: 400 });

    const clientProvider = req.headers.get("x-ai-provider") || undefined;
    const clientKey = req.headers.get("x-ai-key") || undefined;

    const roadmapJson = await generatePlan(project.idea, `Project: ${project.name}. Validated as viable.`, clientProvider, clientKey);
    const roadmap = parseRoadmap(roadmapJson);

    await prisma.project.update({
      where: { id: params.id },
      data: { roadmap: roadmapJson, status: "active" },
    });

    const tasksToCreate: any[] = [];
    for (let day = 1; day <= 180; day++) {
      for (const ms of roadmap.morningStack) {
        tasksToCreate.push({
          projectId: params.id, dayNumber: day, weekNumber: getWeekNumber(day), monthNumber: getMonthNumber(day),
          title: ms.title, description: ms.title, priority: "high", timeEstimate: ms.timeEstimate, whyItMatters: "Daily habit", morningStack: true,
        });
      }
      const dayTasks = roadmap.days[String(day)] ?? [];
      for (const task of dayTasks) {
        tasksToCreate.push({
          projectId: params.id, dayNumber: day, weekNumber: getWeekNumber(day), monthNumber: getMonthNumber(day),
          title: task.title, description: task.description, priority: task.priority ?? "medium", timeEstimate: task.timeEstimate ?? "1 hour", whyItMatters: task.whyItMatters ?? "", morningStack: false,
        });
      }
    }

    const CHUNK = 500;
    for (let i = 0; i < tasksToCreate.length; i += CHUNK) {
      await prisma.dailyTask.createMany({ data: tasksToCreate.slice(i, i + CHUNK) });
    }

    return NextResponse.json({ ok: true, taskCount: tasksToCreate.length, roadmap });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Plan generation failed" }, { status: 500 });
  }
}
