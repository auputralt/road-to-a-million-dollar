import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateViability } from "@/lib/agents";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tasks: true, audits: true } } },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();
    if (!idea || typeof idea !== "string" || idea.trim().length < 5) {
      return NextResponse.json({ error: "Please provide a more detailed idea." }, { status: 400 });
    }

    const clientProvider = req.headers.get("x-ai-provider") || undefined;
    const clientKey = req.headers.get("x-ai-key") || undefined;

    const viability = await evaluateViability(idea.trim(), clientProvider, clientKey);
    const project = await prisma.project.create({
      data: {
        name: idea.trim().slice(0, 120),
        idea: idea.trim(),
        viable: viability.viable,
        status: viability.viable ? "planning" : "archived",
      },
    });

    return NextResponse.json({ project, viability });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 500 });
  }
}
