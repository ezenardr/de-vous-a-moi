import { defineConfig } from "drizzle-kit";
import { databaseCredentials } from "./src/server/db/connection";

// Migrations are generated as SQL files and reviewed before they are applied.
// Never use `drizzle-kit push` against production.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  // Encrypted (see src/server/db/connection.ts). Migrations run as postgres (MIGRATION_DATABASE_URL); the
  // app itself connects as the least-privilege role devousamoi_app (DATABASE_URL, scripts/create-app-role.mjs).
  dbCredentials: databaseCredentials((process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL)!),
  // Owned by the Adonis API until it is decommissioned.
  tablesFilter: ["!adonis_schema", "!adonis_schema_versions"],
});
