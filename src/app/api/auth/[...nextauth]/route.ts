/**
 * @module app/api/auth/[...nextauth]/route
 * @description NextAuth API route handler for all auth endpoints.
 * Handles sign-in, sign-out, session management, and OAuth callbacks.
 */

export { handlers as GET, handlers as POST } from "@/server/auth/config";
