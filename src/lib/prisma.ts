import { PrismaClient } from "@prisma/client";

declare global {
  var __gamingLibraryPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__gamingLibraryPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__gamingLibraryPrisma = prisma;
}
