"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import {
  getCookieConsent,
  setCookieConsent,
  type CookieConsent as ConsentValue,
} from "@/lib/cookies";

export function CookieConsent() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  function choose(value: ConsentValue) {
    setCookieConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[60] p-4 pb-[calc(1rem+4.5rem)] md:bottom-6 md:left-6 md:right-auto md:max-w-md md:p-0 md:pb-0"
    >
      <div className="glass rounded-2xl border border-white/15 p-5 shadow-2xl shadow-black/50">
        <h2
          id="cookie-consent-title"
          className="font-display text-lg font-semibold text-white"
        >
          {t("title")}
        </h2>
        <p id="cookie-consent-desc" className="mt-2 text-sm leading-relaxed text-muted">
          {t("description")}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={() => choose("accepted")}>
            {t("accept")}
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => choose("declined")}
          >
            {t("decline")}
          </Button>
        </div>
      </div>
    </div>
  );
}
