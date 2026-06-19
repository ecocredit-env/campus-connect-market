import { Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";

export function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        <div className="mb-10 border-b border-white/10 pb-8">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">Legal</span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">{title}</h1>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Last updated · {updated}</p>
          {intro && <p className="mt-6 text-base leading-relaxed text-muted-foreground">{intro}</p>}
          <nav className="mt-6 flex flex-wrap gap-2 text-xs">
            <LegalChip to="/terms" label="Terms" current={title.startsWith("Terms")} />
            <LegalChip to="/privacy" label="Privacy" current={title.startsWith("Privacy")} />
            <LegalChip to="/refunds" label="Refunds & UltraProtect" current={title.startsWith("Refunds")} />
            <LegalChip to="/support" label="Support" current={title.startsWith("Support")} />
          </nav>
        </div>
        <div className="space-y-10">{children}</div>
      </main>
    </div>
  );
}

function LegalChip({ to, label, current }: { to: "/terms" | "/privacy" | "/refunds"; label: string; current: boolean }) {
  return (
    <Link
      to={to}
      className={`rounded-full border px-3 py-1.5 transition-colors ${
        current
          ? "border-accent/40 bg-accent/10 text-foreground"
          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
