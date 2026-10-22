// Smoke-tests every public page of a running build against the production data (read-only).
// Usage: node --env-file=.env.local scripts/smoke-public.mjs [baseUrl]
// Never prints personal data: emails are only compared, not shown.
import pg from "pg";
import { databaseSsl } from "../src/server/db/connection.ts";

const base = process.argv[2] ?? "http://localhost:3100";
const slug = (title, id) =>
  title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-") + "-" + id;

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: databaseSsl(),
  options: "-c default_transaction_read_only=on",
});
await client.connect();
const q = async (sql) => (await client.query(sql)).rows;
const emails = (await q("select lower(email) e from users")).map((r) => r.e);
const reads = await q("select read_id, title from reads where archived = false");
const watches = await q("select watch_id, title from watches where archived = false");
const categories = (await q("select distinct category from reads where archived = false")).map((r) => r.category);
await client.end();

for (let i = 0; i < 30; i++) {
  try { await fetch(base); break; } catch { await new Promise((r) => setTimeout(r, 1000)); }
}

const expect200 = [
  "/", "/reads", "/watches", "/categories", "/sitemap.xml",
  ...categories.map((c) => "/categories/" + encodeURIComponent(c)),
  ...reads.map((r) => "/reads/" + slug(r.title, r.read_id)),
  ...watches.map((w) => "/watches/" + slug(w.title, w.watch_id)),
  "/reads/" + slug(reads[0].title, reads[0].read_id) + "/opengraph-image",
];
const expect404 = ["/reads/not-a-real-article", "/reads/x-00000000-0000-4000-8000-000000000000", "/watches/nope"];

const problems = [];
for (const [paths, expected] of [[expect200, 200], [expect404, 404]]) {
  for (const path of paths) {
    const res = await fetch(base + path, { redirect: "manual" });
    const body = (await res.text()).toLowerCase();
    if (res.status !== expected) problems.push(`${res.status} (expected ${expected}) ${path}`);
    if (emails.some((e) => body.includes(e))) problems.push(`EMAIL LEAK ${path}`);
  }
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
const sitemapUrls = (sitemap.match(/<url>/g) ?? []).length;
const expectedUrls = reads.length + watches.length + 4;
if (sitemapUrls !== expectedUrls) problems.push(`sitemap has ${sitemapUrls} urls, expected ${expectedUrls}`);

console.log(`checked ${expect200.length + expect404.length} pages, sitemap ${sitemapUrls} urls`);
console.log(problems.length ? "PROBLEMS:\n" + problems.join("\n") : "OK: all statuses as expected, no email leaks");
process.exit(problems.length ? 1 : 0);
