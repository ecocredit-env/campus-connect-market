import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Bike, Cpu, Snowflake, ArrowRight } from "lucide-react";
import mnnitLogo from "@/assets/mnnit-logo.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UltraOver — Campus marketplace for verified students" },
      { name: "description", content: "Buy & sell used cycles, coolers and electronics on campus. Every seller is a verified student." },
      { property: "og:title", content: "UltraOver — Campus marketplace for verified students" },
      { property: "og:description", content: "Trust built on college ID. No scammers, just classmates." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* HERO — split */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <span className="blob h-72 w-72 -left-20 top-32 bg-accent/40" />
        <span className="blob h-96 w-96 right-[-100px] top-10 bg-secondary/30" style={{ animationDelay: "-6s" }} />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-0 lg:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col justify-between px-6 py-16 sm:px-10 lg:py-24">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                Verified students only
              </span>

              <div className="flex items-start gap-6">
                <h1 className="display text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] text-primary">
                  The campus<br />
                  <span className="text-accent">marketplace</span><br />
                  built on trust.
                </h1>
                <img
                  src={mnnitLogo}
                  alt="Motilal Nehru National Institute of Technology, Allahabad"
                  className="hidden h-32 w-32 shrink-0 object-contain sm:block lg:h-40 lg:w-40"
                />
              </div>

              <p className="max-w-lg text-lg text-muted-foreground">
                Cycles, coolers, laptops, headphones — buy and sell with classmates whose
                college ID has been verified. Meet at safe zones. No middlemen, no scams.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button size="lg" className="gap-2">
                    Join with college ID <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button size="lg" variant="outline">Browse listings</Button>
                </Link>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <Stat n="ID" label="Verified by admin" />
              <Stat n="0₹" label="Platform fee" />
              <Stat n="3" label="Categories live" />
            </div>
          </div>

          {/* Right panel — bold typographic / category tower */}
          <div className="relative grain bg-primary text-primary-foreground">
            <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_20%,oklch(0.62_0.09_200/0.4),transparent_55%)]" />
            <div className="relative flex h-full flex-col justify-between p-8 sm:p-12">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-accent">/ Live categories</p>
              </div>

              <div className="space-y-3 py-12">
                <CatRow icon={<Bike className="h-7 w-7" />} label="CYCLES" count="MTB · Road · BMX" />
                <div className="h-px bg-primary-foreground/15" />
                <CatRow icon={<Cpu className="h-7 w-7" />} label="ELECTRONICS" count="Laptops · Phones · Audio" />
                <div className="h-px bg-primary-foreground/15" />
                <CatRow icon={<Snowflake className="h-7 w-7" />} label="COOLERS" count="Portable · Insulated" />
              </div>

              <div className="space-y-2">
                <p className="display text-3xl leading-tight text-accent sm:text-4xl">
                  Reuse on<br />campus.
                </p>
                <p className="text-sm text-primary-foreground/70">
                  Built by students, for students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-b border-border bg-primary py-8 text-primary-foreground overflow-hidden">
        <div className="marquee">
          <div className="marquee-track display text-5xl sm:text-7xl">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex shrink-0 items-center gap-12">
                <span>VERIFIED ONLY</span>
                <span className="marquee-stroke text-accent">CYCLES</span>
                <span>COOLERS</span>
                <span className="marquee-stroke text-accent">ELECTRONICS</span>
                <span>MEET ON CAMPUS</span>
                <span className="marquee-stroke text-accent">ZERO FEES</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-border py-20">
          <div className="mb-12 flex items-end justify-between gap-4">
            <h2 className="display max-w-xl text-4xl text-primary sm:text-5xl">
              How a safe sale<br />happens here.
            </h2>
            <p className="hidden max-w-sm text-muted-foreground md:block">
              Every transaction starts with a verified profile and ends at a campus safe zone.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
            <Step n="01" title="Verify your ID" body="Upload your college ID. Admin approves within 24–48 hours. One‑time." />
            <Step n="02" title="List or browse" body="Five photos, honest condition, location. Buyers tap Interested." />
            <Step n="03" title="Meet & confirm" body="Pick a safe zone on campus, exchange item, both confirm in the app." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-24 text-primary-foreground grain">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="display text-[clamp(2rem,5vw,4rem)] leading-tight">
            Your old bike is<br />
            <span className="text-accent">someone&apos;s first day</span><br />
            on campus.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" variant="secondary">Create account</Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                See listings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        UltraOver.org · A peer‑to‑peer campus marketplace · v0.1
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="display text-3xl text-primary">{n}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function CatRow({ icon, label, count }: { icon: React.ReactNode; label: string; count: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-4">
        <span className="text-accent">{icon}</span>
        <span className="display text-2xl sm:text-3xl">{label}</span>
      </div>
      <span className="hidden text-xs uppercase tracking-wider text-primary-foreground/60 sm:inline">{count}</span>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="bg-background p-8">
      <span className="display text-sm text-accent">{n}</span>
      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
