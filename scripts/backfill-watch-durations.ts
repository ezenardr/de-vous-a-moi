// One-off: fill watches.duration_seconds from YouTube for videos published before migration 0002.
// Dry run by default; pass --write (with DB_ALLOW_WRITES=true) to update.
//   node --env-file=.env.local scripts/backfill-watch-durations.ts [--write]
import { createRequire } from "node:module";
import { fetchYoutubeDuration } from "../src/lib/youtube.ts";
import { databaseSsl } from "../src/server/db/connection.ts";

const require = createRequire(import.meta.url);
const { Client } = require("pg");
const write = process.argv.includes("--write");
if (write && process.env.DB_ALLOW_WRITES !== "true") throw new Error("--write needs DB_ALLOW_WRITES=true");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: databaseSsl(),
  options: write ? undefined : "-c default_transaction_read_only=on",
});
await client.connect();
try {
  const { rows } = await client.query("select watch_id, video_url from watches where duration_seconds is null");
  let updated = 0;
  for (const row of rows) {
    const seconds = await fetchYoutubeDuration(row.video_url);
    console.log(row.watch_id, seconds ?? "not found");
    if (write && seconds) {
      await client.query("update watches set duration_seconds = $1 where watch_id = $2 and duration_seconds is null", [seconds, row.watch_id]);
      updated++;
    }
  }
  console.log(write ? `updated ${updated}/${rows.length}` : `dry run: ${rows.length} rows`);
} finally {
  await client.end();
}
