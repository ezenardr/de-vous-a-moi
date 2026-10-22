import { defineConfig } from "drizzle-kit";

// Migrations are generated as SQL files and reviewed before they are applied.
// Never use `drizzle-kit push` against production.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
  // Owned by the Adonis API until it is decommissioned.
  tablesFilter: ["!adonis_schema", "!adonis_schema_versions"],
});
