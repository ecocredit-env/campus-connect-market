import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { VerificationBadges } from "@/components/VerificationBadges";

export type ListingCardItem = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  photos: string[];
  location: string | null;
  seller?: {
    verification_status?: string | null;
    college_email_verified?: boolean | null;
  } | null;
};


const conditionLabel: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export function ListingCard({ item }: { item: ListingCardItem }) {
  const photo = item.photos[0];
  return (
    <Link
      to="/listing/$id"
      params={{ id: item.id }}
      className="floating-card liquid-glass group block overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-white/[0.04] to-transparent">
        {photo ? (
          <img
            src={photo}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl font-bold tracking-tighter text-muted-foreground/30">U.</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge className="rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-md">
            {item.category}
          </Badge>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold tracking-tight">{item.title}</h3>
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
            {conditionLabel[item.condition] ?? item.condition}
          </span>
        </div>
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-lg font-semibold tracking-tight text-gradient">
            ₹{Number(item.price).toLocaleString("en-IN")}
          </span>
          {item.location && (
            <span className="truncate text-[11px] text-muted-foreground">{item.location}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
