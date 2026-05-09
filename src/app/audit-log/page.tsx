import { prisma } from "@/lib/prisma";
import AuditLogClient from "./AuditLogClient";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const audits = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { project: { select: { name: true } } },
  });

  const serialized = audits.map((a) => ({
    id: a.id,
    projectId: a.projectId,
    dayNumber: a.dayNumber,
    userInput: a.userInput,
    aiResponse: a.aiResponse,
    createdAt: a.createdAt.toISOString(),
    project: { name: a.project.name },
  }));

  return <AuditLogClient audits={serialized} />;
}
