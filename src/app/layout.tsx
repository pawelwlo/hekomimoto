import type { ReactNode } from "react";

/** Required root layout — html/body live in [locale]/layout.tsx */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
