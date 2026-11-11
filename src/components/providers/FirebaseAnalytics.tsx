"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";
import { getCookieConsent, type CookieConsent } from "@/lib/cookies";

/** Initializes Firebase Analytics only after cookie consent is accepted. */
export function FirebaseAnalytics() {
  useEffect(() => {
    function maybeInit(consent: CookieConsent | null = getCookieConsent()) {
      if (consent === "accepted") {
        void getFirebaseAnalytics();
      }
    }

    maybeInit();

    function onConsent(event: Event) {
      const detail = (event as CustomEvent<CookieConsent>).detail;
      maybeInit(detail);
    }

    window.addEventListener("cookie-consent-changed", onConsent);
    return () => window.removeEventListener("cookie-consent-changed", onConsent);
  }, []);

  return null;
}
