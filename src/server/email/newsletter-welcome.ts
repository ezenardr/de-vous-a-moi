import { escapeHtml } from "./escape";

// Sent once when an address joins the newsletter. Table layout and inline styles for email clients;
// the site's colours (#163300 green, #9fe870 lime, #f9f9f9 canvas) and its "Welcome to our circle".
export function newsletterWelcomeHtml({ siteUrl, unsubscribeUrl }: { siteUrl: string; unsubscribeUrl: string }) {
  const site = escapeHtml(siteUrl);
  const unsubscribe = escapeHtml(unsubscribeUrl);
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bienvenue dans notre cercle de lecteurs</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Helvetica,Arial,sans-serif;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background:#d1fb95;padding:28px 30px;font-size:20px;font-weight:bold;color:#163300;">De vous à moi</td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#0d0d0d;">Bienvenue dans notre cercle de lecteurs.</h1>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#767676;">
                Merci de nous rejoindre. Vous recevrez de temps en temps nos nouvelles histoires, réflexions et vidéos, de moi à vous.
              </p>
              <a href="${site}" style="display:inline-block;background:#9fe870;color:#163300;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 24px;border-radius:5px;">Lire les derniers articles</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 30px;font-size:12px;line-height:1.5;color:#a3a3a3;">
              Vous recevez cet email car cette adresse a été inscrite à la newsletter De vous à moi.
              <a href="${unsubscribe}" style="color:#767676;">Se désinscrire</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
