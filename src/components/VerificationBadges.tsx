import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { cn } from "@/lib/utils";

type Props = {
  emailVerified: boolean;
  idVerified: boolean;
  size?: "sm" | "md";
  className?: string;
  showPending?: boolean; // show greyed-out chips when not yet earned
};

/**
 * Two-tier verification chips.
 * Tier 1 — College email verified (instant, domain-based)
 * Tier 2 — ID verified (manual review)
 */
export function VerificationBadges({
  emailVerified,
  idVerified,
  size = "md",
  className,
  showPending = false,
}: Props) {
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  const icon = size === "sm" ? 11 : 13;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {emailVerified ? (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 rounded-full border-emerald-400/30 bg-emerald-400/10 font-medium text-emerald-300",
            padding,
          )}
          title="College email verified — domain matches a recognised institution"
        >
          <Mail className="h-3 w-3" style={{ width: icon, height: icon }} />
          College email
        </Badge>
      ) : showPending ? (
        <Badge
          variant="outline"
          className={cn("gap-1 rounded-full border-white/10 text-muted-foreground", padding)}
        >
          <Mail className="h-3 w-3" style={{ width: icon, height: icon }} />
          Email not verified
        </Badge>
      ) : null}

      {idVerified ? (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 rounded-full border-sky-400/30 bg-sky-400/10 font-medium text-sky-200",
            padding,
          )}
          title="ID verified — checked by hand by our team"
        >
          <VerifiedBadge size={icon} /> ID verified
        </Badge>
      ) : showPending ? (
        <Badge
          variant="outline"
          className={cn("gap-1 rounded-full border-white/10 text-muted-foreground", padding)}
        >
          <VerifiedBadge size={icon} className="opacity-40" /> ID pending
        </Badge>
      ) : null}
    </div>
  );
}
