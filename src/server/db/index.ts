import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Railway Postgres has no pooler: keep the per-instance pool small and let
// Vercel Fluid compute close idle clients before an instance is suspended.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 5_000,
});
attachDatabasePool(pool);

export const db = drizzle(pool, { schema, casing: "snake_case" });
