/**
 * @module server/auth/config
 * @description Central NextAuth v5 configuration.
 * Wires together PrismaAdapter, OAuth providers, and session callbacks.
 *
 * @example
 * ```ts
 * import { auth, handlers, signIn, signOut } from "@/server/auth/config";
 *
 * // Get session in a server component
 * const session = await auth();
 *
 * // Use handlers in API route
 * export const { GET, POST } = handlers;
 * ```
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/server/lib/db";
import { providers } from "./providers";
import { sessionCallback, signInCallback } from "./callbacks";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    providers,
    callbacks: {
        session: sessionCallback,
        signIn: signInCallback,
    },
    pages: {
        signIn: "/login",
        error: "/auth/error",
    },
    session: {
        strategy: "database",
    },
    debug: process.env.NODE_ENV === "development",
});
