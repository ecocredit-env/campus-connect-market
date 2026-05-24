import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

export type ListingCardItem = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  photos: string[];
  location: string | null;
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
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {photo ? (
          <img
            src={photo}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-mist">
            <span className="display text-3xl text-muted-foreground/40">U.</span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{item.category}</Badge>
          <Badge variant="secondary">{conditionLabel[item.condition] ?? item.condition}</Badge>
        </div>
        <h3 className="line-clamp-2 font-semibold leading-tight">{item.title}</h3>
        <div className="flex items-baseline justify-between pt-1">
          <span className="display text-xl text-primary">₹{Number(item.price).toLocaleString("en-IN")}</span>
          {item.location && (
            <span className="truncate text-xs text-muted-foreground">{item.location}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
