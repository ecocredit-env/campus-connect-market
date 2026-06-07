import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Sparkles, Zap, Lock } from "lucide-react";
import heroShowcase from "@/assets/hero-showcase.jpg";
import catCycle from "@/assets/cat-cycle.jpg";
import catElectronics from "@/assets/cat-electronics.jpg";
import catCooler from "@/assets/cat-cooler.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UltraOver — The premium campus marketplace" },
      { name: "description", content: "A cinematic, verified-only marketplace for students. Buy & sell cycles, electronics and coolers with classmates you can trust." },
      { property: "og:title", content: "UltraOver — The premium campus marketplace" },
      { property: "og:description", content: "Verified students. Cinematic experience. Zero fees." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Header />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative">
        <span className="blob h-[420px] w-[420px] -left-32 top-20 bg-[oklch(0.72_0.18_255/0.55)]" />
        <span className="blob h-[520px] w-[520px] right-[-160px] top-40 bg-[oklch(0.68_0.18_295/0.4)]" style={{ animationDelay: "-6s" }} />

        <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-24 sm:pt-32 lg:pb-44 lg:pt-40">
          <div className="reveal mx-auto mb-8 inline-flex w-full justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl">
              <Sparkles className="h-3 w-3 text-accent" />
              Verified students · Zero fees · Campus only
            </span>
          </div>

          <h1 className="reveal reveal-delay-1 mx-auto max-w-5xl text-center text-[clamp(2.75rem,9vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.04em]">
            <span className="liquid-text">The marketplace</span>
            <br />
            <span className="liquid-text">built on trust.</span>
          </h1>

          <p className="reveal reveal-delay-2 mx-auto mt-8 max-w-xl text-center text-base text-muted-foreground sm:text-lg">
            Cycles, electronics, coolers — bought and sold by classmates whose college ID is verified. Cinematic. Minimal. Engineered for campus.
          </p>

          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="btn-glass group h-12 gap-2 rounded-full bg-foreground px-7 text-background hover:bg-foreground">
                Join with college ID
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="btn-glass h-12 rounded-full border-white/15 bg-white/[0.04] px-7 text-foreground hover:bg-white/[0.08]">
                Browse listings
              </Button>
            </Link>
          </div>

          {/* Cinematic hero product showcase */}
          <div className="reveal reveal-delay-3 ambient relative mx-auto mt-24 max-w-6xl">
            <div className="liquid-glass glow-ring relative overflow-hidden rounded-[2rem] p-2">
              <div className="relative overflow-hidden rounded-[1.6rem]">
                <img
                  src={heroShowcase}
                  alt="Floating premium products — bicycles, laptops, headphones and coolers in cinematic light"
                  className="h-full w-full object-cover"
                  width={1920}
                  height={1080}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 sm:bottom-10 sm:left-10 sm:right-10">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-accent">/ Live now</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl text-gradient">Trusted by your campus.</p>
                  </div>
                  <Link to="/browse">
                    <Button size="sm" className="btn-glass h-10 rounded-full bg-white/10 px-5 text-foreground hover:bg-white/15">
                      Explore <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY SHOWCASE ─────────────────────────────── */}
      <section className="relative border-t border-white/5 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">/ Categories</span>
              <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
                <span className="text-gradient">Curated for</span><br />
                <span className="text-gradient-accent">campus life.</span>
              </h2>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Three categories. Every listing reviewed. Every seller verified.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <CategoryCard image={catCycle} title="Cycles" desc="MTB · Road · BMX · Hybrid" />
            <CategoryCard image={catElectronics} title="Electronics" desc="Laptops · Phones · Audio · Tablets" />
            <CategoryCard image={catCooler} title="Coolers" desc="Portable · Insulated · Personal" />
          </div>
        </div>
      </section>


      {/* ── MARQUEE ─────────────────────────────────────── */}
      <section className="relative border-y border-white/5 py-10 overflow-hidden">
        <div className="marquee">
          <div className="marquee-track text-5xl font-bold tracking-tighter sm:text-7xl">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex shrink-0 items-center gap-12">
                <span className="text-gradient">VERIFIED ONLY</span>
                <span className="marquee-stroke text-accent">CYCLES</span>
                <span className="text-gradient">COOLERS</span>
                <span className="marquee-stroke text-accent">ELECTRONICS</span>
                <span className="text-gradient">CAMPUS SAFE ZONES</span>
                <span className="marquee-stroke text-accent">ZERO FEES</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 max-w-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">/ How it works</span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="text-gradient">A safe sale,</span><br />
              <span className="text-gradient-accent">end to end.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Step n="01" icon={<Lock className="h-5 w-5" />} title="Verify your ID" body="Upload your college ID. Admin approves within 24–48 hours. One-time." />
            <Step n="02" icon={<Sparkles className="h-5 w-5" />} title="List or browse" body="Five photos, honest condition, location. Buyers tap Interested." />
            <Step n="03" icon={<Zap className="h-5 w-5" />} title="Meet & confirm" body="Pick a safe zone on campus. Exchange. Both confirm in the app." />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative pb-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-strong glow-ring relative overflow-hidden rounded-3xl px-8 py-20 text-center sm:px-16">
            <span className="blob h-72 w-72 -left-20 top-0 bg-[oklch(0.72_0.18_255/0.45)]" />
            <span className="blob h-72 w-72 right-[-50px] bottom-0 bg-[oklch(0.68_0.18_295/0.4)]" style={{ animationDelay: "-4s" }} />
            <p className="relative text-[clamp(2rem,5vw,4rem)] font-bold leading-[1] tracking-tight">
              <span className="text-gradient">Your old bike is</span><br />
              <span className="text-gradient-accent">someone's first day</span><br />
              <span className="text-gradient">on campus.</span>
            </p>
            <div className="relative mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/signup">
                <Button size="lg" className="h-12 rounded-full bg-foreground px-7 text-background hover:bg-foreground/90">
                  Create account
                </Button>
              </Link>
              <Link to="/browse">
                <Button size="lg" variant="outline" className="h-12 rounded-full border-white/15 bg-white/[0.04] px-7 hover:bg-white/[0.08]">
                  See listings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <span>© UltraOver — A peer-to-peer campus marketplace</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-accent" /> Verified students only · v0.2
          </span>
        </div>
      </footer>
    </div>
  );
}


function CategoryCard({ image, title, desc }: { image: string; title: string; desc: string }) {
  return (
    <Link to="/browse" className="floating-card liquid-glass group relative block overflow-hidden rounded-3xl">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-110"
          loading="lazy"
          width={1024}
          height={1024}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-7">
        <h3 className="text-3xl font-bold tracking-tight text-gradient">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          Explore <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

function Step({ n, icon, title, body }: { n: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="floating-card liquid-glass group relative overflow-hidden rounded-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-medium tracking-[0.2em] text-accent">{n}</span>
        <span className="text-muted-foreground transition-colors group-hover:text-accent">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
