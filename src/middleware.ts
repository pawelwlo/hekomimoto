import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { LOCALE_COOKIE, resolveLocaleFromRequest } from "./lib/geo-locale";

const intlMiddleware = createMiddleware(routing);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function withLocaleCookie(response: NextResponse, locale: "pl" | "en") {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Explicit English URL wins
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return withLocaleCookie(intlMiddleware(request), "en");
  }

  // Already decided for this browser
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (existing === "en") {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/" ? "/en" : pathname.startsWith("/en") ? pathname : `/en${pathname}`;
    if (url.pathname !== pathname) {
      return withLocaleCookie(NextResponse.redirect(url), "en");
    }
    return withLocaleCookie(intlMiddleware(request), "en");
  }
  if (existing === "pl") {
    return withLocaleCookie(intlMiddleware(request), "pl");
  }

  // First visit: geo → locale
  const locale = await resolveLocaleFromRequest(request);

  if (locale === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    return withLocaleCookie(NextResponse.redirect(url), "en");
  }

  return withLocaleCookie(intlMiddleware(request), "pl");
}

export const config = {
  matcher: [
    "/",
    "/(pl|en)/:path*",
    "/((?!api|admin|_next|_vercel|.*\\..*).*)",
  ],
};
