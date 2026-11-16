import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Admin | Hekomimoto",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">{children}</main>
      </body>
    </html>
  );
}
