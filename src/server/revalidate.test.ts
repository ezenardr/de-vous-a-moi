import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidated = vi.hoisted(() => [] as string[]);
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: (path: string) => void revalidated.push(path) }));
const { revalidatePage } = await import("./revalidate");

describe("revalidatePage", () => {
  beforeEach(() => void revalidated.splice(0));

  it("revalidates plain site paths only", () => {
    for (const ok of ["/", "/saved", "/reads/le-jargon-df30c1c3-a4c3-4c0a-af5c-b8cd4fddff4f", "/categories/Actualit%C3%A9s"]) revalidatePage(ok);
    for (const bad of ["", "saved", "//evil.example", "https://evil.example/", "/a?b=c", "/a b", "/" + "x".repeat(300), 42, null]) revalidatePage(bad);
    expect(revalidated).toEqual(["/", "/saved", "/reads/le-jargon-df30c1c3-a4c3-4c0a-af5c-b8cd4fddff4f", "/categories/Actualit%C3%A9s"]);
  });
});
