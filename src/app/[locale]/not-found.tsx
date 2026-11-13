import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-white">
        Page not found / Nie znaleziono strony
      </h1>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white"
      >
        Hekomimoto
      </Link>
    </div>
  );
}
