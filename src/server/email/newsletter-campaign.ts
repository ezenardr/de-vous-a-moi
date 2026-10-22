import "server-only";
import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";
import { escapeHtml } from "./escape";

// A newsletter from /admin/newsletter. Same frame as the welcome email (lime header, white card,
// #f9f9f9 canvas). The body comes from the editor: only text structure is kept, and every tag gets
// inline styles because many email clients ignore <style>.

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "a", "ul", "ol", "li", "blockquote", "h2", "h3"],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: { h1: "h2", h4: "h3", h5: "h3", h6: "h3", div: "p", b: "strong", i: "em" },
};

const STYLES: Record<string, string> = {
  p: "margin:0 0 16px;font-size:16px;line-height:1.6;color:#333333;",
  h2: "margin:28px 0 12px;font-size:22px;line-height:1.25;color:#0d0d0d;",
  h3: "margin:24px 0 10px;font-size:18px;line-height:1.3;color:#0d0d0d;",
  a: "color:#163300;font-weight:bold;text-decoration:underline;",
  ul: "margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.6;color:#333333;",
  ol: "margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.6;color:#333333;",
  li: "margin:0 0 6px;",
  blockquote: "margin:0 0 16px;padding:4px 0 4px 16px;border-left:3px solid #3d552b;color:#484848;font-style:italic;",
};

export function newsletterBodyHtml(raw: string): string {
  const $ = cheerio.load(sanitizeHtml(raw, SANITIZE), null, false);
  $("p").each((_, el) => {
    const p = $(el);
    if (!p.text().trim()) p.remove();
  });
  for (const [tag, style] of Object.entries(STYLES)) $(tag).attr("style", style);
  return $.html();
}

export type NewsletterCard = { kindLabel: string; title: string; description: string; imageUrl: string; url: string };

function card(item: NewsletterCard) {
  return `<tr>
  <td style="padding:0 0 20px;">
    <a href="${escapeHtml(item.url)}" style="text-decoration:none;color:inherit;display:block;">
      <img src="${escapeHtml(item.imageUrl)}" alt="" width="460" style="display:block;width:100%;max-width:460px;height:auto;border-radius:5px;border:0;">
      <p style="margin:12px 0 4px;font-size:12px;font-weight:bold;letter-spacing:0.5px;text-transform:uppercase;color:#85c15d;">${escapeHtml(item.kindLabel)}</p>
      <p style="margin:0 0 4px;font-size:18px;line-height:1.3;font-weight:bold;color:#0d0d0d;">${escapeHtml(item.title)}</p>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#767676;">${escapeHtml(item.description)}</p>
    </a>
  </td>
</tr>`;
}

export function newsletterCampaignHtml({
  subject,
  preheader,
  body,
  cards,
  siteUrl,
  unsubscribeUrl,
}: {
  subject: string;
  preheader: string;
  body: string; // raw editor HTML
  cards: NewsletterCard[];
  siteUrl: string;
  unsubscribeUrl: string;
}) {
  const cardsHtml = cards.length
    ? `<tr><td style="padding:8px 30px 10px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cards.map(card).join("")}</table></td></tr>`
    : "";
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Helvetica,Arial,sans-serif;color:#333333;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background:#d1fb95;padding:28px 30px;font-size:20px;font-weight:bold;color:#163300;">
              <a href="${escapeHtml(siteUrl)}" style="color:#163300;text-decoration:none;">De vous à moi</a>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 30px 14px;">${newsletterBodyHtml(body)}</td>
          </tr>
          ${cardsHtml}
          <tr>
            <td style="padding:10px 30px 30px;font-size:12px;line-height:1.5;color:#a3a3a3;border-top:1px solid #f1f1f1;">
              Vous recevez cet email car cette adresse est inscrite à la newsletter De vous à moi.
              <a href="${escapeHtml(unsubscribeUrl)}" style="color:#767676;">Se désinscrire</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
