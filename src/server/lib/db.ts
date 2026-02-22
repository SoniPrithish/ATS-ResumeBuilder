/**
 * @module server/lib/db
 * @description Prisma client singleton with global caching for development
 * hot-reload. Uses @prisma/adapter-pg for Prisma 7 compatibility.
 *
 * In production, a single instance is created. In development,
 * the instance is stored on `globalThis` to survive module reloads.
 *
 * @example
 * ```ts
 * import { db } from "@/server/lib/db";
 * const user = await db.user.findUnique({ where: { id } });
 * ```
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });
}

/**
 * Prisma client singleton instance.
 * Uses global caching in development to prevent connection exhaustion
 * during Next.js hot module replacement.
 */
export const db: PrismaClient =
    globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}
