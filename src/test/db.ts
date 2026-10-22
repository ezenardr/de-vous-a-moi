// In-memory Postgres with the production schema plus every pending migration, for testing writes
// without touching prod.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@/server/db/schema";

const sql = (file: string) => readFileSync(file, "utf8").replaceAll("--> statement-breakpoint", "");

export async function createTestDb() {
  const client = new PGlite();
  await client.exec(sql(path.join(import.meta.dirname, "schema.sql")));
  const migrations = path.join(import.meta.dirname, "../../drizzle");
  for (const file of readdirSync(migrations).filter((f) => /^\d{4}_.*\.sql$/.test(f) && !f.startsWith("0000_")).sort()) {
    await client.exec(sql(path.join(migrations, file)));
  }
  return drizzle(client, { schema });
}
