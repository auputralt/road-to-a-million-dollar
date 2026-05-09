import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const day = req.nextUrl.searchParams.get("day");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "7");

  if (day) {
    const plan = await prisma.dailyPlan.findUnique({
      where: { projectId_dayNumber: { projectId: params.id, dayNumber: parseInt(day) } },
    });
    return NextResponse.json({ plan });
  }

  const plans = await prisma.dailyPlan.findMany({
    where: { projectId: params.id },
    orderBy: { dayNumber: "desc" },
    take: limit,
  });
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { dayNumber, plan, journal } = await req.json();
    if (!dayNumber) return NextResponse.json({ error: "dayNumber required" }, { status: 400 });

    const upserted = await prisma.dailyPlan.upsert({
      where: { projectId_dayNumber: { projectId: params.id, dayNumber } },
      update: {
        ...(plan !== undefined ? { plan } : {}),
        ...(journal !== undefined ? { journal } : {}),
      },
      create: {
        projectId: params.id,
        dayNumber,
        plan: plan ?? "",
        journal: journal ?? "",
      },
    });

    return NextResponse.json({ ok: true, plan: upserted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
