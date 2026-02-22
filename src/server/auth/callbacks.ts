/**
 * @module server/auth/callbacks
 * @description NextAuth callback functions for session and JWT management.
 * Enriches the session with the database user ID.
 */

import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Session callback: injects user.id into the client-accessible session object.
 */
export function sessionCallback({
    session,
    user,
}: {
    session: Session;
    user: User;
    token?: JWT;
}) {
    if (session.user && user?.id) {
        session.user.id = user.id;
    }
    return session;
}

/**
 * Sign-in callback: can be used to restrict sign-in.
 * Currently allows all sign-ins.
 */
export function signInCallback() {
    return true;
}
