import type { ConnectionOptions } from "node:tls";

// How every Postgres connection is made: the app pool, drizzle-kit migrations and scripts.
// Plain module (no "server-only"), so drizzle.config.ts and scripts can import it too.

// The database is reached through Railway's public TCP proxy, so connections must be encrypted.
// Railway signs its certificate with its own self-signed authority: by default the traffic is
// encrypted (TLS) without verifying that chain, as Railway documents. Setting DATABASE_CA to that
// authority's PEM certificate turns full verification on.
export function databaseSsl(): ConnectionOptions {
  const ca = process.env.DATABASE_CA?.replace(/\\n/g, "\n");
  return ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false };
}

// drizzle-kit only takes `ssl` with discrete credentials, not with a URL.
export function databaseCredentials(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.replace(/^\//, "")),
    ssl: databaseSsl(),
  };
}
