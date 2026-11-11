import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";

type ServiceCardProps = {
  href: string;
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
  ctaLabel: string;
};

export function ServiceCard({
  href,
  title,
  description,
  icon,
  className,
  ctaLabel,
}: ServiceCardProps) {
  return (
    <Link href={href} className={cn("group block h-full", className)}>
      <GlassPanel className="flex h-full flex-col transition duration-300 group-hover:border-accent/40 group-hover:bg-white/[0.06]">
        {icon ? (
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
            {icon}
          </div>
        ) : null}
        <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
          {ctaLabel}
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </GlassPanel>
    </Link>
  );
}
