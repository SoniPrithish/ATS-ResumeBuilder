/**
 * @module server/lib/db
 * @description Prisma client singleton with global caching for development
 * hot-reload. In production, a single instance is created. In development,
 * the instance is stored on `globalThis` to survive module reloads.
 *
 * @example
 * ```ts
 * import { db } from "@/server/lib/db";
 * const user = await db.user.findUnique({ where: { id } });
 * ```
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Prisma client singleton instance.
 * Uses global caching in development to prevent connection exhaustion
 * during Next.js hot module replacement.
 */
export const db: PrismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}
