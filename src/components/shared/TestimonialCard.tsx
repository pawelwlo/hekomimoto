import { Star } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

type TestimonialCardProps = {
  name: string;
  role: string;
  text: string;
};

export function TestimonialCard({ name, role, text }: TestimonialCardProps) {
  return (
    <GlassPanel className="h-full">
      <div className="mb-3 flex gap-0.5 text-accent" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-neutral-200">&ldquo;{text}&rdquo;</p>
      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="font-semibold text-white">{name}</p>
        <p className="text-xs text-muted">{role}</p>
      </div>
    </GlassPanel>
  );
}
