"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";

/** Initializes Firebase Analytics in the browser only. */
export function FirebaseAnalytics() {
  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  return null;
}
