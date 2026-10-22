import "server-only";
import { revalidatePath } from "next/cache";
import z from "zod";

// Some actions refresh "the page the visitor is on", whose path comes from the browser. Only a plain
// path on this site is accepted (no protocol, no "//", no query, 300 characters max); anything else is
// ignored rather than passed to revalidatePath.
const pagePath = z
  .string()
  .max(300)
  .regex(/^\/(?!\/)[A-Za-z0-9\-._~%/]*$/);

export function revalidatePage(pathname: unknown) {
  const parsed = pagePath.safeParse(pathname);
  if (parsed.success) revalidatePath(parsed.data);
}
