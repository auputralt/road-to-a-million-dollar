import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getDayNumber, parseRoadmap } from "@/lib/roadmap-utils";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: { params: { projectId: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: { audits: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  if (!project || !project.viable) notFound();

  const dayNumber = getDayNumber(project.createdAt);
  const roadmap = parseRoadmap(project.roadmap);

  const tasks = await prisma.dailyTask.findMany({
    where: { projectId: project.id, dayNumber },
    orderBy: [{ morningStack: "desc" }, { priority: "asc" }],
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const morningTasks = tasks.filter((t) => t.morningStack);
  const regularTasks = tasks.filter((t) => !t.morningStack);

  const monthNumber = Math.min(6, Math.ceil(dayNumber / 30));
  const currentMonth = roadmap.months.find((m) => m.month === monthNumber);

  return (
    <DashboardClient
      project={{ id: project.id, name: project.name, createdAt: project.createdAt.toISOString() }}
      dayNumber={dayNumber}
      totalTasks={totalTasks}
      completedTasks={completedTasks}
      morningTasks={morningTasks}
      regularTasks={regularTasks}
      currentMonth={currentMonth ?? null}
      roadmapSummary={roadmap.summary}
      recentAudits={project.audits.map((a) => ({ dayNumber: a.dayNumber, userInput: a.userInput, aiResponse: a.aiResponse, createdAt: a.createdAt.toISOString() }))}
    />
  );
}
