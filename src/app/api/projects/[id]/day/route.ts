import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDayNumber } from "@/lib/roadmap-utils";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id }, select: { createdAt: true } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ day: getDayNumber(project.createdAt) });
}
