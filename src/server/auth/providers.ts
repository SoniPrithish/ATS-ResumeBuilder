/**
 * @module server/auth/providers
 * @description OAuth provider configurations for NextAuth v5.
 * Supports GitHub (with repo scope for resume sync) and Google OAuth.
 */

import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

const githubClientId =
    process.env.GITHUB_CLIENT_ID ?? process.env.AUTH_GITHUB_ID;
const githubClientSecret =
    process.env.GITHUB_CLIENT_SECRET ?? process.env.AUTH_GITHUB_SECRET;
const googleClientId =
    process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID;
const googleClientSecret =
    process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET;

/**
 * GitHub OAuth provider with repo scope for optional GitHub resume sync.
 */
export const githubProvider = GitHub({
    clientId: githubClientId!,
    clientSecret: githubClientSecret!,
    authorization: {
        params: {
            scope: "read:user user:email",
        },
    },
});

/**
 * Google OAuth provider for standard sign-in.
 */
export const googleProvider = Google({
    clientId: googleClientId!,
    clientSecret: googleClientSecret!,
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
