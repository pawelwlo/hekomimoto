import { siteConfig } from "@/content/site";

/** Absolute asset base — prefer live App Hosting until hekomimoto.com serves this app. */
function assetBase() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://hekomimoto-web--hekomimoto.europe-west4.hosted.app"
  );
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function emailLink(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="color:#e3262a;text-decoration:none;font-weight:600;">${escapeHtml(label)}</a>`;
}

export function emailRows(rows: [string, string][]) {
  return rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;width:38%;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#a3a3a3;">${label}</td>
        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);font-family:Outfit,Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#ffffff;line-height:1.4;">${value}</td>
      </tr>`,
    )
    .join("");
}

type BrandedEmailInput = {
  lang?: "pl" | "en";
  /** Small eyebrow under the logo */
  eyebrow: string;
  /** Main headline */
  title: string;
  /** HTML body (already escaped / safe markup) */
  bodyHtml: string;
  footerNote?: string;
};

/**
 * Dark branded shell matching the Hekomimoto site
 * (background #0a0a0a, accent #e3262a, gold #d6b36a).
 */
export function brandedEmailHtml({
  lang = "pl",
  eyebrow,
  title,
  bodyHtml,
  footerNote,
}: BrandedEmailInput) {
  const logoUrl = `${assetBase()}/ikona-3.png`;
  const siteUrl = siteConfig.url;
  const note =
    footerNote ??
    (lang === "en"
      ? `${siteConfig.address.full} · ${siteConfig.phone}`
      : `${siteConfig.address.full} · ${siteConfig.phone}`);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Outfit:wght@400;600&display=swap" rel="stylesheet" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#141414;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
          <tr>
            <td style="padding:28px 28px 20px;border-bottom:1px solid rgba(255,255,255,0.08);background:#111111;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${logoUrl}" width="40" height="40" alt="Hekomimoto" style="display:block;border:0;border-radius:8px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;letter-spacing:0.02em;line-height:1;color:#ffffff;">
                      Hekomi<span style="color:#e3262a;">moto</span>
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#d6b36a;">
                ${escapeHtml(eyebrow)}
              </p>
              <h1 style="margin:10px 0 0;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;line-height:1.25;color:#ffffff;">
                ${escapeHtml(title)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;font-family:Outfit,Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#e5e5e5;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.08);">
                <tr>
                  <td style="padding-top:20px;font-family:Outfit,Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#a3a3a3;">
                    ${escapeHtml(note)}<br />
                    <a href="${escapeHtml(siteUrl)}" style="color:#e3262a;text-decoration:none;">hekomimoto.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
