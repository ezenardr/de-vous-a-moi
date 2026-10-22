import "server-only";
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Byte-compatible with @adonisjs/hash's scrypt driver (PHC string, unpadded base64):
//   $scrypt$n=16384,r=8,p=1$<salt>$<hash>
// Hashes written here must stay verifiable by the Adonis API while both apps share the users table.
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const SALT_SIZE = 16;
const KEY_LENGTH = 64;
const MAX_MEMORY = 32 * 1024 * 1024;

function scryptAsync(password: string, salt: Buffer, keyLength: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

const toB64 = (buffer: Buffer) => buffer.toString("base64").replace(/=+$/, "");
const fromB64 = (value: string) => Buffer.from(value, "base64");

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_SIZE);
  const key = await scryptAsync(password, salt, KEY_LENGTH, {
    cost: COST,
    blockSize: BLOCK_SIZE,
    parallelization: PARALLELIZATION,
    maxmem: MAX_MEMORY,
  });
  return `$scrypt$n=${COST},r=${BLOCK_SIZE},p=${PARALLELIZATION}$${toB64(salt)}$${toB64(key)}`;
}

export async function verifyPassword(hashed: string, password: string): Promise<boolean> {
  const match = hashed.match(/^\$scrypt\$n=(\d+),r=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/);
  if (!match) return false;
  const [, n, r, p, salt, hash] = match;
  const expected = fromB64(hash);
  try {
    const actual = await scryptAsync(password, fromB64(salt), expected.byteLength, {
      cost: Number(n),
      blockSize: Number(r),
      parallelization: Number(p),
      maxmem: MAX_MEMORY,
    });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
