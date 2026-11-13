import { getTranslations } from "next-intl/server";
import { MapPin, Mail, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { serviceRoutes, siteConfig } from "@/content/site";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tServices = await getTranslations("services");
  const tCta = await getTranslations("cta");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 lg:grid-cols-4">
        <div>
          <p className="font-logo text-2xl text-white">
            Hekomi<span className="text-accent">moto</span>
          </p>
          <p className="mt-3 text-sm text-muted">{t("tagline")}</p>
          <div className="mt-5">
            <LanguageSwitcher />
          </div>
          <div className="mt-6 flex gap-3">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-muted hover:text-accent"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {t("services")}
          </h3>
          <ul className="mt-4 space-y-2">
            {serviceRoutes.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="text-sm text-muted transition-colors hover:text-accent"
                >
                  {tServices(`${s.key}.title`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {t("contact")}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>
              <a
                href={siteConfig.phoneHref}
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <Phone className="h-4 w-4 text-accent" />
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.emailHref}
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <Mail className="h-4 w-4 text-accent" />
                {siteConfig.email}
              </a>
            </li>
            <li className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {siteConfig.name}
                <br />
                {siteConfig.address.line1}
                <br />
                {siteConfig.address.line2}
              </span>
            </li>
          </ul>
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-white">{t("hours")}</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>
                {t("weekdays")}: {siteConfig.hours.weekdays}
              </li>
              <li>
                {t("saturday")}: {siteConfig.hours.saturday}
              </li>
              <li>
                {t("sunday")}: {t("closed")}
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {t("map")}
          </h3>
          {/* CLIENT: replace with Google Maps embed API key / custom map if needed */}
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <iframe
              title={t("map")}
              src={siteConfig.mapsEmbedUrl}
              className="h-40 w-full grayscale invert-[0.9] contrast-125"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={siteConfig.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-accent hover:underline"
          >
            {tCta("getDirections")}
          </a>
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-white">{t("company")}</h4>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted hover:text-accent">
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted hover:text-accent">
                  {tNav("faq")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted hover:text-accent">
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-muted">
        © {year} {siteConfig.name}. {t("rights")}
      </div>
    </footer>
  );
}
