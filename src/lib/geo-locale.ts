import type { NextRequest } from "next/server";
import type { Locale } from "@/i18n/routing";

export const LOCALE_COOKIE = "NEXT_LOCALE";

function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

function countryFromHeaders(request: NextRequest) {
  const raw =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cloudfront-viewer-country") ||
    request.headers.get("x-country-code") ||
    request.headers.get("x-appengine-country");
  if (!raw || raw === "XX" || raw === "T1") return null;
  return raw.trim().toUpperCase();
}

async function countryFromIp(ip: string) {
  if (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.")
  ) {
    return null;
  }

  try {
    const res = await fetch(
      `https://ipapi.co/${encodeURIComponent(ip)}/country_code/`,
      {
        headers: { Accept: "text/plain" },
        signal: AbortSignal.timeout(1200),
      },
    );
    if (!res.ok) return null;
    const code = (await res.text()).trim().toUpperCase();
    if (code.length === 2 && /^[A-Z]{2}$/.test(code)) return code;
  } catch {
    // ignore lookup failures — fall back below
  }
  return null;
}

/** Poland → pl, anywhere else known → en, unknown → pl (workshop default). */
export async function resolveLocaleFromRequest(
  request: NextRequest,
): Promise<Locale> {
  const headerCountry = countryFromHeaders(request);
  if (headerCountry) return headerCountry === "PL" ? "pl" : "en";

  const ip = clientIp(request);
  if (ip) {
    const ipCountry = await countryFromIp(ip);
    if (ipCountry) return ipCountry === "PL" ? "pl" : "en";
  }

  return "pl";
}
