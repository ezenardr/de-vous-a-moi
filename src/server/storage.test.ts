import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/server/auth/permissions", () => ({ ActionError: class ActionError extends Error {} }));
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = async (command: { input: unknown }) => void sent.push(command.input);
  },
  PutObjectCommand: class {
    constructor(public input: unknown) {}
  },
  DeleteObjectCommand: class {
    constructor(public input: unknown) {}
  },
}));
const sent: unknown[] = [];
const { deleteImage, normalizeImage, storageEnv, uploadImage } = await import("./storage");

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

describe("S3 storage", () => {
  const png = async () =>
    new File([new Uint8Array(await sharp({ create: { width: 10, height: 10, channels: 3, background: "#fff" } }).png().toBuffer())], "a.png", {
      type: "image/png",
    });

  it("is production only on the live deployment, unless STORAGE_ENV says otherwise", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(storageEnv()).toBe("production");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(storageEnv()).toBe("development");
    vi.stubEnv("STORAGE_ENV", "production");
    expect(storageEnv()).toBe("production");
    vi.unstubAllEnvs();
  });

  it("uploads under <env>/de-vous-a-moi/<folder>/ and serves through CloudFront", async () => {
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("AWS_BUCKET", "bucket");
    vi.stubEnv("AWS_CLOUDFRONT_URL", "https://cdn.example.net/");
    sent.length = 0;
    const { fileId, url } = await uploadImage(await png(), "watches");
    expect(fileId).toMatch(/^development\/de-vous-a-moi\/watches\/[0-9a-f-]{36}\.webp$/);
    expect(url).toBe(`https://cdn.example.net/${fileId}`);
    expect(sent[0]).toMatchObject({ Bucket: "bucket", Key: fileId, ContentType: "image/webp" });
    vi.unstubAllEnvs();
  });

  it("only deletes files from its own environment", async () => {
    vi.stubEnv("VERCEL_ENV", "");
    sent.length = 0;
    await deleteImage("production/de-vous-a-moi/reads/a.webp");
    await deleteImage("6650f1c2000a1b2c3d4e"); // an Appwrite id
    expect(sent).toHaveLength(0);
    await deleteImage("development/de-vous-a-moi/reads/a.webp");
    expect(sent).toMatchObject([{ Key: "development/de-vous-a-moi/reads/a.webp" }]);
    vi.unstubAllEnvs();
  });
});
