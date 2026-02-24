export default function Slugify(text: string): string {
  return encodeURIComponent(
    text.trim().replace(/\s+/g, "-").replace(/-+/g, "-"),
  );
}
