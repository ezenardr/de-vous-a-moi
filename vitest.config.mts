import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "server-only": path.resolve(import.meta.dirname, "src/test/empty.ts"),
    },
  },
  test: {
    environment: "node",
    // Parity checks hit the production DB (read-only) and the live API: opt-in only.
    include: process.env.npm_lifecycle_event === "parity" ? ["src/**/*.parity.ts"] : ["src/**/*.test.ts"],
    testTimeout: 60_000,
    // Each test builds an in-memory Postgres (PGlite) in beforeEach; under load that can pass the
    // default 10s hook limit and fail tests at random.
    hookTimeout: 60_000,
  },
});
