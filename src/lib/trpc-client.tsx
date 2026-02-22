/**
 * @module lib/trpc-client
 * @description tRPC React client setup with React Query integration.
 * Provides the TRPCProvider component and typed tRPC hooks.
 *
 * @example
 * ```tsx
 * import { trpc } from "@/lib/trpc-client";
 *
 * function MyComponent() {
 *   const { data } = trpc.someRouter.someQuery.useQuery();
 * }
 * ```
 */

"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    createTRPCReact,
    httpBatchLink,
    loggerLink,
} from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "@/server/trpc/router";

/** Typed tRPC React hooks */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Create a standalone tRPC client (for use outside React).
 */
function getBaseUrl() {
    if (typeof window !== "undefined") return "";
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * TRPCProvider — wraps the app with tRPC and React Query providers.
 * Should be placed in the root layout.
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" && opts.result instanceof Error),
                }),
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`,
                    transformer: superjson,
                }),
            ],
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
    );
}
