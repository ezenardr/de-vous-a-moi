import "server-only";
import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";

export type TocEntry = { id: string; text: string };

// Article HTML comes from the editor (often pasted from Word): it carries inline fonts, sizes and
// colours, and must not be trusted. Keep the structure, drop all styling, so every article renders
// with the Figma typography. Stored content is never modified.
const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "h2", "h3", "img", "figure", "figcaption", "hr"],
  allowedAttributes: { a: ["href", "title"], img: ["src", "alt"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  transformTags: { h1: "h2", h4: "h3", h5: "h3", h6: "h3", div: "p" },
  // Disallowed tags (span, font, …) are removed but their text is kept.
};

const BLANK = /^[\s ​]*$/;

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function prepareArticle(raw: string): { html: string; toc: TocEntry[] } {
  const $ = cheerio.load(sanitizeHtml(raw, SANITIZE), null, false);

  // Empty spacer paragraphs (the editor's way of adding space) would break the 15px rhythm.
  $("p").each((_, el) => {
    const p = $(el);
    if (BLANK.test(p.text()) && p.find("img").length === 0) p.remove();
  });

  // Articles without headings: a paragraph that is only bold text acts as a heading.
  if ($("h2, h3").length === 0) {
    $("p").each((_, el) => {
      const p = $(el);
      const text = p.text().trim();
      const onlyBold = p.children().length > 0 && p.contents().toArray().every((node) =>
        node.type === "text" ? BLANK.test($(node).text()) : node.type === "tag" && ["strong", "b"].includes(node.name),
      );
      if (onlyBold && text.length >= 3 && text.length <= 120) p.replaceWith(`<h2>${$.html(p.contents())}</h2>`);
    });
  }

  const toc: TocEntry[] = [];
  const used = new Set<string>();
  $("h2, h3").each((i, el) => {
    const heading = $(el);
    const text = heading.text().replace(/\s+/g, " ").trim();
    if (!text) return void heading.remove();
    let id = slugify(text) || `section-${i + 1}`;
    while (used.has(id)) id = `${id}-${i + 1}`;
    used.add(id);
    heading.attr("id", id);
    // Headings are styled bold already; nested bold adds nothing.
    heading.find("strong, b").each((_, b) => void $(b).replaceWith($(b).contents()));
    toc.push({ id, text });
  });

  $("a[href]").each((_, el) => {
    const link = $(el);
    if (/^https?:\/\//.test(link.attr("href") ?? "")) link.attr({ target: "_blank", rel: "noopener noreferrer" });
  });
  $("img").each((_, el) => void $(el).attr({ loading: "lazy", decoding: "async" }));

  return { html: $.html(), toc };
}
