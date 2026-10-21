// Shrinks an image in the browser before upload. Vercel caps request bodies at ~4.5MB,
// so large photos are re-encoded as WebP (and downscaled if needed) to stay under `maxBytes`.
// The server compresses again to ~1MB, so this only has to get the file through the door.
export async function compressImage(file: File, maxBytes = 3 * 1024 * 1024): Promise<File> {
  if (file.size <= maxBytes || !file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file);
  let width = Math.min(bitmap.width, 2400);
  for (let quality = 0.85; ; ) {
    const height = Math.round((bitmap.height * width) / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && (blob.size <= maxBytes || width <= 400)) {
      bitmap.close();
      return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
    }
    if (quality > 0.6) quality -= 0.1;
    else width = Math.round(width * 0.75);
  }
}
