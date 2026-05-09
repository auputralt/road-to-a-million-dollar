import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      tasks: { orderBy: { dayNumber: "asc" } },
      audits: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
