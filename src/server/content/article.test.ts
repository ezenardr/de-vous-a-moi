import { describe, expect, it } from "vitest";
import { prepareArticle } from "./article";

describe("prepareArticle", () => {
  it("strips pasted formatting but keeps structure", () => {
    const { html } = prepareArticle(
      '<p style="font-family: Arial"><span style="color: red; font-size: 18px">Bonjour <strong class="x">le monde</strong></span></p>',
    );
    expect(html).toBe("<p>Bonjour <strong>le monde</strong></p>");
  });

  it("removes scripts, event handlers and javascript: links", () => {
    const { html } = prepareArticle(
      '<p onclick="alert(1)">Texte<script>alert(1)</script><a href="javascript:alert(1)">lien</a><img src="x" onerror="alert(1)"></p>',
    );
    expect(html).not.toMatch(/script|onclick|onerror|javascript:/);
  });

  it("builds the table of contents from h2/h3 with stable, unique ids", () => {
    const { html, toc } = prepareArticle("<h1>Introduction</h1><p>a</p><h2>🌿 1. Le mythe</h2><h3>Le mythe</h3>");
    expect(toc).toEqual([
      { id: "introduction", text: "Introduction" },
      { id: "1-le-mythe", text: "🌿 1. Le mythe" },
      { id: "le-mythe", text: "Le mythe" },
    ]);
    expect(html).toContain('<h2 id="introduction">');
  });

  it("uses bold-only paragraphs as headings when an article has none", () => {
    const { toc, html } = prepareArticle("<p><strong>Premier point</strong></p><p>Texte <strong>gras</strong> normal</p>");
    expect(toc).toEqual([{ id: "premier-point", text: "Premier point" }]);
    expect(html).toContain('<h2 id="premier-point">Premier point</h2>');
    expect(html).toContain("<p>Texte <strong>gras</strong> normal</p>");
  });

  it("keeps bold paragraphs as text when real headings exist", () => {
    const { toc } = prepareArticle("<h2>Vrai titre</h2><p><strong>Juste du gras</strong></p>");
    expect(toc.map((t) => t.text)).toEqual(["Vrai titre"]);
  });

  it("drops empty spacer paragraphs but keeps image paragraphs", () => {
    const { html } = prepareArticle('<p>&nbsp;</p><p>Texte</p><p><img src="https://cdn/x.jpg" alt=""></p><p> </p>');
    expect(html).toBe('<p>Texte</p><p><img src="https://cdn/x.jpg" alt="" loading="lazy" decoding="async"></p>');
  });

  it("opens external links safely in a new tab", () => {
    const { html } = prepareArticle('<p><a href="https://example.com">x</a> <a href="/reads">y</a></p>');
    expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a>');
    expect(html).toContain('<a href="/reads">y</a>');
  });
});

describe("inline images", () => {
  it("serves our uploads through the image optimizer with a srcset, and leaves other images alone", () => {
    const upload = "https://nyc.cloud.appwrite.io/v1/storage/buckets/b/files/f/view?project=p";
    const { html } = prepareArticle(`<p><img src="${upload}" alt="Photo"></p><p><img src="https://example.com/x.jpg" alt=""></p>`);
    const enc = encodeURIComponent(upload);
    expect(html).toContain(`src="/_next/image?url=${enc}&amp;w=1080&amp;q=75"`);
    expect(html).toContain(`/_next/image?url=${enc}&amp;w=640&amp;q=75 640w`);
    expect(html).toContain(`/_next/image?url=${enc}&amp;w=1920&amp;q=75 1920w`);
    expect(html).toContain(`sizes="(min-width: 1024px) 700px, 100vw"`);
    expect(html).toContain(`<img src="https://example.com/x.jpg" alt="" loading="lazy" decoding="async">`);
  });

  it("does not treat look-alike hosts as uploads", () => {
    const { html } = prepareArticle(`<p><img src="https://nyc.cloud.appwrite.io.evil.example/x.jpg" alt=""></p><p><img src="http://nyc.cloud.appwrite.io/x.jpg" alt=""></p>`);
    expect(html).not.toContain("/_next/image");
  });
});
