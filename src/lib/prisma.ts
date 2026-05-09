import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const isTurso = url.startsWith("libsql://") || url.startsWith("https://");

  if (isTurso) {
    const adapter = new PrismaLibSql({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter } as any);
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
