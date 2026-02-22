/**
 * @module app/api/auth/[...nextauth]/route
 * @description NextAuth API route handler for all auth endpoints.
 * Handles sign-in, sign-out, session management, and OAuth callbacks.
 */

import { handlers } from "@/server/auth/config";

export const { GET, POST } = handlers;
