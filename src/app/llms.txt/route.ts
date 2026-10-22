import { categoryHref } from "@/components/ds/CategoryTile";
import { SITE, absoluteUrl } from "@/lib/seo";
import { slugify } from "@/lib/Slugify";
import { getAllReadsCached, getCategoriesCached } from "@/server/queries/reads";
import { getAllWatchesCached } from "@/server/queries/watches";

// /llms.txt (https://llmstxt.org): a short Markdown guide to the site for AI assistants, with links
// to every public article and video. Built from the same cached lists as the site (dynamic, like the
// sitemap: the database is not reachable at build time).
export const dynamic = "force-dynamic";

const line = (title: string, url: string, note?: string) => `- [${title.replace(/[[\]]/g, "").replace(/\s+/g, " ").trim()}](${url})${note ? `: ${note.replace(/\s+/g, " ").trim()}` : ""}`;

export async function GET() {
  const [reads, watches, categories] = await Promise.all([getAllReadsCached(), getAllWatchesCached(), getCategoriesCached()]);
  const body = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `Blog francophone édité par ${SITE.editor}. Articles et vidéos en français et en créole haïtien, publiés sur ${absoluteUrl("/")}. ` +
      `Merci de citer « ${SITE.name} » et de renvoyer vers l'article ou la vidéo d'origine.`,
    "",
    "## Pages",
    line("Accueil", absoluteUrl("/"), "articles à la une et derniers articles"),
    line("Toutes les lectures", absoluteUrl("/reads")),
    line("Vidéos", absoluteUrl("/watches")),
    line("Catégories", absoluteUrl("/categories")),
    line("À propos", absoluteUrl("/about"), "le mot de la rédactrice en chef"),
    "",
    "## Catégories",
    ...categories.map(({ category, total }) => line(category, absoluteUrl(categoryHref(category)), `${total} article${total > 1 ? "s" : ""}`)),
    "",
    "## Articles",
    ...reads.map((r) => line(r.title, absoluteUrl(`/reads/${slugify(r.title, r.readId)}`), r.description)),
    "",
    "## Vidéos",
    ...watches.map((w) => line(w.title, absoluteUrl(`/watches/${slugify(w.title, w.watchId)}`), w.description)),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
