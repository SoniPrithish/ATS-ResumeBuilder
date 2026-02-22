import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./tests/setup.ts"],
        include: ["tests/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
        exclude: ["node_modules", ".next", "coverage"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html", "lcov"],
            include: ["src/modules/parser/**/*.{ts,tsx}", "src/modules/ats/**/*.{ts,tsx}"],
            exclude: [
                "src/**/*.test.{ts,tsx}",
                "src/**/*.d.ts",
                "src/types/**",
                "src/app/api/**",
                "src/server/lib/**",
                "src/server/trpc/**",
                "src/app/layout.tsx",
                "src/app/page.tsx",
                "node_modules",
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80,
            },
        },
        testTimeout: 10000,
        hookTimeout: 10000,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
