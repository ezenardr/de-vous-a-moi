import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// There is no staging database: local development runs against production.
// Outside a production deployment every session is read-only, enforced by Postgres,
// unless DB_ALLOW_WRITES=true is set deliberately.
const readOnly =
  process.env.VERCEL_ENV !== "production" && process.env.DB_ALLOW_WRITES !== "true";

// Railway Postgres has no pooler: keep the per-instance pool small and let
// Vercel Fluid compute close idle clients before an instance is suspended.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 5_000,
  options: readOnly ? "-c default_transaction_read_only=on" : undefined,
});
attachDatabasePool(pool);

export const db = drizzle(pool, { schema });
