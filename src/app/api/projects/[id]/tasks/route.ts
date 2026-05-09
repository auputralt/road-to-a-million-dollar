import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDayNumber } from "@/lib/roadmap-utils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const url = new URL(req.url);
  const dayParam = url.searchParams.get("day");
  const dayNumber = dayParam ? parseInt(dayParam, 10) : getDayNumber(project.createdAt);

  const tasks = await prisma.dailyTask.findMany({
    where: { projectId: params.id, dayNumber },
    orderBy: [{ morningStack: "desc" }, { priority: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ dayNumber, tasks, totalDays: 180 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { taskId, completed } = await req.json();
  const task = await prisma.dailyTask.update({
    where: { id: taskId },
    data: { completed },
  });
  return NextResponse.json(task);
}
