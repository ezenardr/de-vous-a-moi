// One-off: move the images still on Appwrite to S3 (see src/server/storage.ts for the layout) and point
// the database at them: cover/avatar URLs and file ids, and images inside article and newsletter HTML.
// Files keep their Appwrite id as name (<env>/de-vous-a-moi/<folder>/<appwriteId>.<ext>), so a re-run
// skips what is already copied and picks up anything uploaded to Appwrite since. Appwrite is not touched.
// Dry run by default (checks every file is downloadable); --write needs DB_ALLOW_WRITES=true and an
// explicit STORAGE_ENV (production or development), the folder the files go to.
// --copy-only copies the files (needs STORAGE_ENV) but leaves the database as it is, e.g. before the
// site that accepts S3 URLs is deployed.
//   node --env-file=.env.local scripts/migrate-images-to-s3.ts [--copy-only | --write]
import { createRequire } from "node:module";
import { databaseSsl } from "../src/server/db/connection.ts";

const require = createRequire(import.meta.url);
const { Client } = require("pg");
const { S3Client, HeadObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

const copyOnly = process.argv.includes("--copy-only");
const write = process.argv.includes("--write");
if (write && process.env.DB_ALLOW_WRITES !== "true") throw new Error("--write needs DB_ALLOW_WRITES=true");
const upload = write || copyOnly;
const env = process.env.STORAGE_ENV ?? (upload ? undefined : "production");
if (env !== "production" && env !== "development") throw new Error("--write and --copy-only need STORAGE_ENV=production or development");

type Folder = "profiles" | "reads" | "watches";
// A cover or avatar: the URL column, and the file id column (Appwrite id, then the S3 key).
const SINGLE: { table: string; id: string; url: string; file: string; folder: Folder }[] = [
  { table: "users", id: "user_id", url: "profile_image_url", file: "image_file_id", folder: "profiles" },
  { table: "reads", id: "read_id", url: "image_url", file: "image_file_id", folder: "reads" },
  { table: "read_drafts", id: "read_draft_id", url: "image_url", file: "image_file_id", folder: "reads" },
  { table: "watches", id: "watch_id", url: "image_url", file: "image_file_id", folder: "watches" },
];
// HTML with inline images (uploaded from the article editor, hence "reads").
const HTML: { table: string; id: string; col: string; folder: Folder }[] = [
  { table: "reads", id: "read_id", col: "content", folder: "reads" },
  { table: "read_drafts", id: "read_draft_id", col: "content", folder: "reads" },
  { table: "newsletter_campaigns", id: "campaign_id", col: "body", folder: "reads" },
];

// Any Appwrite file URL (view/preview/download, with its query string, `&` possibly written `&amp;`).
const APPWRITE_URL = /https:\/\/nyc\.cloud\.appwrite\.io\/v1\/storage\/buckets\/([\w.-]+)\/files\/([\w.-]+)\/(?:view|preview|download)(?:\?[^"'\s<>)]*)?/g;
const EXTENSIONS: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/avif": "avif" };

const cdn = process.env.AWS_CLOUDFRONT_URL!.replace(/\/+$/, "");
const bucket = process.env.AWS_BUCKET!;
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY },
});

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: databaseSsl(),
  options: write ? undefined : "-c default_transaction_read_only=on",
});

type Found = { bucketId: string; fileId: string; folder: Folder };
const quote = (name: string) => `"${name}"`;

// Every Appwrite file referenced anywhere above, by "<folder>/<fileId>".
async function collect() {
  const files = new Map<string, Found>();
  const add = (text: string | null, folder: Folder) => {
    for (const [, bucketId, fileId] of (text ?? "").matchAll(APPWRITE_URL)) files.set(`${folder}/${fileId}`, { bucketId, fileId, folder });
  };
  for (const t of SINGLE) {
    const { rows } = await db.query(`select ${quote(t.url)} as v from ${quote(t.table)} where ${quote(t.url)} like '%appwrite.io%'`);
    rows.forEach((r: { v: string }) => add(r.v, t.folder));
  }
  for (const t of HTML) {
    const { rows } = await db.query(`select ${quote(t.col)} as v from ${quote(t.table)} where ${quote(t.col)} like '%appwrite.io%'`);
    rows.forEach((r: { v: string }) => add(r.v, t.folder));
  }
  return files;
}

async function exists(key: string) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// Downloads one file and (with --write) copies it to S3. Returns its new URL and key, or null if Appwrite
// doesn't have it any more.
async function migrate({ bucketId, fileId, folder }: Found) {
  const source = `https://nyc.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
  const res = await fetch(source, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) return null;
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = EXTENSIONS[type];
  if (!ext) throw new Error(`${fileId}: unexpected content type "${type}"`);
  const key = `${env}/de-vous-a-moi/${folder}/${fileId}.${ext}`;
  const body = Buffer.from(await res.arrayBuffer());
  if (upload && !(await exists(key))) {
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: type, CacheControl: "public, max-age=31536000, immutable" }),
    );
  }
  return { key, url: `${cdn}/${key}`, bytes: body.length };
}

// Replaces each Appwrite URL of a known file; unknown or missing ones stay as they are.
function rewrite(text: string, folder: Folder, moved: Map<string, { key: string; url: string }>) {
  return text.replace(APPWRITE_URL, (match, _bucketId, fileId) => moved.get(`${folder}/${fileId}`)?.url ?? match);
}

await db.connect();
try {
  const files = await collect();
  console.log(`${files.size} Appwrite files referenced (${upload ? `copying to ${env}/` : `dry run, would copy to ${env}/`})`);

  const moved = new Map<string, { key: string; url: string }>();
  const missing: string[] = [];
  let bytes = 0;
  const queue = [...files];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        const [name, found] = next;
        const result = await migrate(found);
        if (!result) missing.push(name);
        else {
          moved.set(name, result);
          bytes += result.bytes;
        }
      }
    }),
  );
  console.log(`downloadable: ${moved.size} (${(bytes / 1024 / 1024).toFixed(1)} MB), missing on Appwrite: ${missing.length}`);
  missing.forEach((name) => console.log(`  missing: ${name}`));

  // Rows are re-read under lock, so an edit made meanwhile is not overwritten.
  if (write) await db.query("begin");
  const counts: Record<string, number> = {};
  for (const t of SINGLE) {
    const { rows } = await db.query(
      `select ${quote(t.id)} as id, ${quote(t.url)} as url from ${quote(t.table)} where ${quote(t.url)} like '%appwrite.io%'${write ? " for update" : ""}`,
    );
    for (const row of rows) {
      const fileId = [...row.url.matchAll(APPWRITE_URL)][0]?.[2];
      const target = fileId && moved.get(`${t.folder}/${fileId}`);
      if (!target) continue;
      counts[`${t.table}.${t.url}`] = (counts[`${t.table}.${t.url}`] ?? 0) + 1;
      if (write) {
        await db.query(`update ${quote(t.table)} set ${quote(t.url)} = $1, ${quote(t.file)} = $2 where ${quote(t.id)} = $3`, [target.url, target.key, row.id]);
      }
    }
  }
  for (const t of HTML) {
    const { rows } = await db.query(
      `select ${quote(t.id)} as id, ${quote(t.col)} as v from ${quote(t.table)} where ${quote(t.col)} like '%appwrite.io%'${write ? " for update" : ""}`,
    );
    for (const row of rows) {
      const next = rewrite(row.v, t.folder, moved);
      if (next === row.v) continue;
      counts[`${t.table}.${t.col}`] = (counts[`${t.table}.${t.col}`] ?? 0) + 1;
      if (write) await db.query(`update ${quote(t.table)} set ${quote(t.col)} = $1 where ${quote(t.id)} = $2`, [next, row.id]);
    }
  }
  if (write) await db.query("commit");
  console.log(write ? "rows updated:" : "rows that would be updated:", counts);

  // Anything still pointing at Appwrite that this script doesn't handle.
  const { rows: cols } = await db.query(
    "select table_name, column_name from information_schema.columns where table_schema = 'public' and data_type in ('text', 'character varying', 'jsonb')",
  );
  for (const { table_name, column_name } of cols) {
    const { rows } = await db.query(`select count(*)::int as n from ${quote(table_name)} where ${quote(column_name)}::text like '%appwrite.io%'`);
    if (rows[0].n) console.log(`still on Appwrite: ${table_name}.${column_name} (${rows[0].n} rows)`);
  }
} catch (error) {
  if (write) await db.query("rollback").catch(() => {});
  throw error;
} finally {
  await db.end();
}
