import { cn } from "@/lib/utils";

/**
 * Scalloped blue verification badge with a soft 3D feel,
 * inspired by the reference checkmark seal.
 */
export function VerifiedBadge({
  className,
  size = 16,
  title = "Verified",
}: {
  className?: string;
  size?: number;
  title?: string;
}) {
  // 12-point scalloped seal path generated around a 50,50 center.
  // Outer radius 46, inner radius 40, 24 alternating points.
  const cx = 50;
  const cy = 50;
  const outer = 46;
  const inner = 40;
  const points = 12;
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2) + " ";
  }
  d += "Z";

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("inline-block shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]", className)}
      role="img"
      aria-label={title}
    >
      <defs>
        <radialGradient id="vb-fill" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#7ec0ff" />
          <stop offset="55%" stopColor="#3b9af0" />
          <stop offset="100%" stopColor="#1e6fd0" />
        </radialGradient>
        <linearGradient id="vb-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#vb-fill)" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={d} fill="url(#vb-shine)" opacity="0.5" />
      <path
        d="M33 52 L45 64 L68 39"
        fill="none"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
