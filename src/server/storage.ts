import "server-only";
import { Client, ID, Storage } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import sharp from "sharp";
import { ActionError } from "@/server/auth/permissions";

// The bucket is production storage. Outside a production deployment, uploads and deletes are
// refused unless STORAGE_ALLOW_WRITES=true, so local testing can't add or remove live images.
const canWrite =
  process.env.VERCEL_ENV === "production" || process.env.STORAGE_ALLOW_WRITES === "true";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

let storage: Storage | undefined;
function client() {
  return (storage ??= new Storage(
    new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_SECRET!),
  ));
}

const bucketId = () => process.env.APPWRITE_BUCKET_ID!;

export function previewUrl(fileId: string) {
  return `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId()}/files/${fileId}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
}

export function isUploadedImage(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

// Validates, compresses to ~1MB (same as the API) and uploads. Returns the Appwrite file id and URL.
export async function uploadImage(file: File, name: string) {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new ActionError("Format d'image non supporté (jpg, png ou webp).");
  if (file.size > MAX_UPLOAD_BYTES) throw new ActionError("L'image ne doit pas dépasser 10 Mo.");
  if (!canWrite) throw new ActionError("Envoi d'images désactivé en local (STORAGE_ALLOW_WRITES).");
  const buffer = await compressToTarget(Buffer.from(await file.arrayBuffer()), 1024 * 1024);
  const uploaded = await client().createFile({
    bucketId: bucketId(),
    fileId: ID.unique(),
    file: InputFile.fromBuffer(buffer, name),
  });
  return { fileId: uploaded.$id, url: previewUrl(uploaded.$id) };
}

// Best effort: a missing file must not block the user's action.
export async function deleteImage(fileId: string | null | undefined) {
  if (!fileId) return;
  if (!canWrite) {
    console.info(`[storage:not-deleted] ${fileId}`);
    return;
  }
  await client()
    .deleteFile({ bucketId: bucketId(), fileId })
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
