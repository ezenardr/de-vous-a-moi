"use client";
import { UploadInlineImage } from "@/action/reads";
import { compressImage } from "@/lib/compressImage";

// Images pasted or picked in the editor arrive as data: URLs. Before saving, each one is uploaded
// and its src replaced by the hosted URL, so article HTML never carries megabytes of base64.
export async function uploadInlineImages(html: string): Promise<string> {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const images = Array.from(doc.querySelectorAll<HTMLImageElement>("img[src^='data:']"));
  await Promise.all(
    images.map(async (img) => {
      const blob = await fetch(img.getAttribute("src")!).then((r) => r.blob());
      const body = new FormData();
      body.append("file", await compressImage(new File([blob], "inline-image.jpg", { type: blob.type || "image/jpeg" })));
      const result = await UploadInlineImage(body);
      if (!result.success) throw new Error(result.error);
      img.setAttribute("src", result.url);
    }),
  );
  return doc.body.innerHTML;
}

// Picked files become a data: URL (max 1920px, JPEG under ~1 MB) that uploadInlineImages sends on save.
export function imageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = document.createElement("img");
      img.onerror = () => reject(new Error("Image illisible"));
      img.onload = () => {
        const MAX = 1920;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        let quality = 0.85;
        let url = canvas.toDataURL("image/jpeg", quality);
        while (url.length > 1.37 * 1024 * 1024 && quality > 0.2) {
          quality -= 0.1;
          url = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(url);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
