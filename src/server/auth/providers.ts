/**
 * @module server/auth/providers
 * @description OAuth provider configurations for NextAuth v5.
 * Supports GitHub (with repo scope for resume sync) and Google OAuth.
 */

import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

/**
 * GitHub OAuth provider with repo scope for optional GitHub resume sync.
 */
export const githubProvider = GitHub({
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
    authorization: {
        params: {
            scope: "read:user user:email repo",
        },
    },
});

/**
 * Google OAuth provider for standard sign-in.
 */
export const googleProvider = Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    authorization: {
        params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
        },
    },
});

/** All configured auth providers */
export const providers = [githubProvider, googleProvider];
