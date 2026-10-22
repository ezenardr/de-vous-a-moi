import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/server/auth/permissions", () => ({ ActionError: class ActionError extends Error {} }));
const { normalizeImage } = await import("./storage");

describe("normalizeImage", () => {
  it("caps the width at 2000px, converts to WebP and drops EXIF (GPS included)", async () => {
    const photo = await sharp({ create: { width: 4000, height: 3000, channels: 3, background: { r: 200, g: 120, b: 60 } } })
      .jpeg()
      .withExif({ IFD0: { Make: "Phone", Model: "Camera" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "18/1 32/1 0/1" } })
      .toBuffer();
    expect((await sharp(photo).metadata()).exif).toBeDefined();

    const out = await normalizeImage(photo);
    const meta = await sharp(out).metadata();
    expect(meta).toMatchObject({ format: "webp", width: 2000, height: 1500 });
    expect(meta.exif).toBeUndefined();
    expect(out.length).toBeLessThan(photo.length);
  });

  it("never enlarges small images", async () => {
    const small = await sharp({ create: { width: 300, height: 200, channels: 3, background: "#fff" } }).png().toBuffer();
    expect(await sharp(await normalizeImage(small)).metadata()).toMatchObject({ format: "webp", width: 300, height: 200 });
  });
});
