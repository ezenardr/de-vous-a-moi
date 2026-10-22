import "server-only";
import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { ActionError } from "@/server/auth/permissions";

// Images live in the shared S3 bucket (AWS_BUCKET) under <environment>/de-vous-a-moi/<folder>/<uuid>.webp
// and are served through CloudFront. The environment comes from VERCEL_ENV (production on the live site,
// development locally and on previews); STORAGE_ENV overrides it, e.g. for a script run against production.
export type ImageFolder = "profiles" | "reads" | "watches";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function storageEnv(): "production" | "development" {
  return (process.env.STORAGE_ENV ?? process.env.VERCEL_ENV) === "production" ? "production" : "development";
}

const keyPrefix = () => `${storageEnv()}/de-vous-a-moi/`;

let s3: S3Client | undefined;
function client() {
  return (s3 ??= new S3Client({
    region: process.env.AWS_REGION!,
    credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
  }));
}

export function publicUrl(key: string) {
  return `${process.env.AWS_CLOUDFRONT_URL!.replace(/\/+$/, "")}/${key}`;
}

export function isUploadedImage(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

// Every upload is re-encoded the same way: the camera's rotation applied, at most 2000px wide (never
// enlarged), WebP at quality 82. sharp drops metadata, so EXIF data such as GPS location is not stored.
// The site resizes again per screen (next/image); emails and old clients use this file as is.
export async function normalizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
}

// Validates, normalizes, keeps it under ~1MB (same as the API) and uploads. The S3 key is the file id.
export async function uploadImage(file: File, folder: ImageFolder) {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new ActionError("Format d'image non supporté (jpg, png ou webp).");
  if (file.size > MAX_UPLOAD_BYTES) throw new ActionError("L'image ne doit pas dépasser 10 Mo.");
  const buffer = await compressToTarget(await normalizeImage(Buffer.from(await file.arrayBuffer())), 1024 * 1024);
  const key = `${keyPrefix()}${folder}/${randomUUID()}.webp`;
  await client().send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: "image/webp",
      // Keys are never reused, so the file can be cached forever.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return { fileId: key, url: publicUrl(key) };
}

// Best effort: a missing file must not block the user's action. Only this environment's files are
// deleted, so a development server pointed at the production database can't remove live images;
// ids from before S3 (Appwrite) are left alone too.
export async function deleteImage(fileId: string | null | undefined) {
  if (!fileId) return;
  if (!fileId.startsWith(keyPrefix())) {
    console.info(`[storage:not-deleted] ${fileId}`);
    return;
  }
  await client()
    .send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET!, Key: fileId }))
    .catch((error) => console.error("deleteImage failed", fileId, error));
}

export async function compressToTarget(buffer: Buffer, maxBytes: number): Promise<Buffer> {
  if (buffer.length <= maxBytes) return buffer;
  let output = buffer;
  for (let quality = 90; quality > 10; quality -= 5) {
    output = await sharp(buffer).webp({ quality }).toBuffer();
    if (output.length <= maxBytes) return output;
  }
  let width = (await sharp(buffer).metadata()).width ?? 1920;
  while (width > 100) {
    width = Math.floor(width * 0.75);
    output = await sharp(buffer).resize({ width }).webp({ quality: 10 }).toBuffer();
    if (output.length <= maxBytes) return output;
  }
  return output;
}
