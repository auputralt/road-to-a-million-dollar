import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contacts = await prisma.contact.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, tag, notes } = await req.json();
    if (!name || typeof name !== "string") return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const contact = await prisma.contact.create({
      data: { name, email: email || null, phone: phone || null, tag: tag || null, notes: notes || null },
    });
    return NextResponse.json(contact);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create contact" }, { status: 500 });
  }
}
