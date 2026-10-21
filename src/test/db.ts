// In-memory Postgres with the production schema, for testing writes without touching prod.
import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@/server/db/schema";

export async function createTestDb() {
  const client = new PGlite();
  const sql = readFileSync(path.join(import.meta.dirname, "schema.sql"), "utf8").replaceAll("--> statement-breakpoint", "");
  await client.exec(sql);
  return drizzle(client, { schema });
}
