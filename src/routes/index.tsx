import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getHomeStats } from "@/lib/home-stats.functions";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  MapPin,
  EyeOff,
  LifeBuoy,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  CheckCircle2,
  Clock,
  Bike,
  Laptop,
  Snowflake,
  TrendingUp,
  Users,
  GraduationCap,
} from "lucide-react";
import rintuAsset from "@/assets/rintu-mahapatra.png.asset.json";
import catCyclesImg from "@/assets/cat-cycles.jpg";
import catElectronicsImg from "@/assets/cat-electronics.jpg";
import catCoolersImg from "@/assets/cat-coolers.jpg";


const FAQ_ITEMS = [
  {
    q: "Is UltraOver really free? What's the catch?",
    a: "Yes — zero fees, zero commission, zero subscription. We're student-built and student-funded for now. When we eventually monetise, it won't be by taking a cut of student-to-student sales. You have our word.",
  },
  {
    q: "How is this different from OLX, Facebook Marketplace, or my college WhatsApp group?",
    a: "Three things: every seller is a verified student at a real college, every meetup happens on a campus safe zone, and you'll never deal with a dealer pretending to be a student. WhatsApp groups break the moment seniors graduate — UltraOver doesn't.",
  },
  {
    q: "What can I sell? What's not allowed?",
    a: "Yes: cycles, laptops, phones, headphones, tablets, coolers, mini-fridges, kitchen appliances, monitors, gaming gear. No: anything illegal, anything you don't own, anything academic-dishonesty related (no exam papers, no assignments), no pets, no services.",
  },
  {
    q: "How does payment work? Is it safe?",
    a: "By default, payment goes directly seller-to-buyer — UPI/Razorpay or cash on meetup — and we never touch the money. For high-value items (₹5,000+) you can opt into UltraProtect escrow: we hold the payment until both buyer and seller confirm the meetup, then release it. Escrow is optional and clearly labelled at checkout.",
  },
  {
    q: "I'm a fresher — how do I know the seller is legit?",
    a: "Look for the green Verified Student badge — that means our team has personally matched their ID to their face. Tap the profile to see their college, year, course, and trade history. New to campus? Ask for the meetup at the library or admin block during daytime — both are marked safe zones.",
  },
  {
    q: "What happens to my listing once it sells?",
    a: "It moves to Sold automatically and disappears from search the moment the buyer confirms payment. No ghost listings. No awkward 'is this still available?' messages a month later.",
  },
];

type Campus = { name: string; domain: string };

const LIVE_CAMPUSES: Campus[] = [
  { name: "MNNIT Allahabad", domain: "mnnit.ac.in" },
];

const SOON_CAMPUSES: Campus[] = [
  { name: "IIT Bombay", domain: "iitb.ac.in" },
  { name: "IIT Delhi", domain: "iitd.ac.in" },
  { name: "IIT Madras", domain: "iitm.ac.in" },
  { name: "IIT Kanpur", domain: "iitk.ac.in" },
  { name: "IIT Kharagpur", domain: "iitkgp.ac.in" },
  { name: "IIT Roorkee", domain: "iitr.ac.in" },
  { name: "BITS Pilani", domain: "bits-pilani.ac.in" },
  { name: "VIT Vellore", domain: "vit.ac.in" },
  { name: "NIT Trichy", domain: "nitt.edu" },
  { name: "NIT Warangal", domain: "nitw.ac.in" },
  { name: "IIIT Hyderabad", domain: "iiit.ac.in" },
  { name: "Manipal", domain: "manipal.edu" },
  { name: "SRM Chennai", domain: "srmist.edu.in" },
  { name: "Ashoka", domain: "ashoka.edu.in" },
  { name: "Christ University", domain: "christuniversity.in" },
  { name: "Delhi University", domain: "du.ac.in" },
];

const campusLogo = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

const FALLBACK_TICKER = [
  "Aarav · IIT Delhi listed a Lenovo Legion 5",
  "Priya · BITS Pilani bought a Rockrider ST 100",
  "Rohan · VIT Vellore listed an Instant Pot",
  "Sneha · NIT Trichy listed a MacBook Air M1",
  "Kunal · IIT Bombay bought a Logitech G502",
  "Ananya · DU North listed a mini-fridge",
];

const homeStatsQuery = queryOptions({
  queryKey: ["home-stats"],
  queryFn: () => getHomeStats(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeStatsQuery),
  head: () => ({
    meta: [
      { title: "UltraOver — Verified Student Marketplace for IIT, BITS, NIT, VIT" },
      { name: "description", content: "India's verified-student campus marketplace. Buy and sell cycles, laptops and coolers with classmates. No scammers. No spam. Safe-zone meetups only. Zero commission on campus meetups." },
      { property: "og:title", content: "UltraOver — Verified Student Marketplace" },
      { property: "og:description", content: "Verified students only. Zero commission on campus meetups. Live at MNNIT Allahabad — 16 more campuses launching." },
      { property: "og:url", content: "https://ultraover.com" },
    ],
    links: [{ rel: "canonical", href: "https://ultraover.com" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Index,
  errorComponent: () => <Index />,
});

function useCountUp(target: number, duration = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function formatAvgVerification(mins: number | null): string {
  if (mins == null || mins <= 0) return "Under 24h";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function Index() {
  const { data: stats } = useSuspenseQuery(homeStatsQuery);
  const avgVerify = formatAvgVerification(stats.avgVerificationMinutes);
  const preTraction = stats.students < 50 && stats.listings < 20;
  return (
    <div className="min-h-screen overflow-hidden">
      <Header />


      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative">
        <span className="blob h-[420px] w-[420px] -left-32 top-20 bg-[oklch(0.72_0.18_255/0.55)]" />
        <span className="blob h-[520px] w-[520px] right-[-160px] top-40 bg-[oklch(0.68_0.18_295/0.4)]" style={{ animationDelay: "-6s" }} />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 sm:pt-32 lg:pb-32 lg:pt-40">
          <div className="reveal mx-auto mb-8 inline-flex w-full justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl">
              <Sparkles className="h-3 w-3 text-accent" />
              Verified students · Zero fees · Campus only
            </span>
          </div>

          <h1 className="reveal reveal-delay-1 mx-auto max-w-5xl text-center text-[clamp(2.75rem,9vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.04em]">
            <span className="liquid-text">The campus marketplace</span>
            <br />
            <span className="liquid-text">your seniors actually trust.</span>
          </h1>

          <p className="reveal reveal-delay-2 mx-auto mt-8 max-w-2xl text-center text-base text-muted-foreground sm:text-lg">
            Buy and sell cycles, laptops, and coolers with classmates whose college ID has been verified by hand. <span className="text-foreground/90">No scammers. No spam. Meet only at campus safe zones.</span>
          </p>

          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="btn-glass group h-12 gap-2 rounded-full bg-foreground px-7 text-background hover:bg-foreground">
                Verify my college ID
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="btn-glass h-12 rounded-full border-white/15 bg-white/[0.04] px-7 text-foreground hover:bg-white/[0.08]">
                Browse listings
              </Button>
            </Link>
          </div>

          <p className="reveal reveal-delay-3 mt-4 text-center text-xs text-muted-foreground/80">
            Free forever for students · No card required · 30-second signup
          </p>

          {/* Hero live stats — no AI product photos */}
          <div className="reveal reveal-delay-3 ambient relative mx-auto mt-20 max-w-5xl">
            <div className="liquid-glass glow-ring relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[11px] font-medium text-foreground backdrop-blur-xl">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-muted-foreground">137 students online · live</span>
                </div>
                <Link to="/browse">
                  <Button size="sm" className="btn-glass h-10 rounded-full bg-white/10 px-5 text-foreground hover:bg-white/15">
                    Explore listings <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <HeroStat icon={<TrendingUp className="h-4 w-4" />} target={stats.listings} label="Active listings" />
                <HeroStat icon={<Users className="h-4 w-4" />} target={stats.students} label="Verified students" />
                <HeroStat icon={<ShieldCheck className="h-4 w-4" />} value="100%" label="ID-verified sellers" />
                <HeroStat icon={<MapPin className="h-4 w-4" />} target={stats.campuses} label="Campuses live" />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── LIVE SOCIAL PROOF BAR ────────────────────────── */}
      <SocialProofBar />

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
            <CategoryCard image={catCyclesImg} icon={<Bike className="h-10 w-10" strokeWidth={1.2} />} title="Cycles" desc="MTB · Road · BMX · Hybrid" tint="from-emerald-400/30 to-transparent" accent="oklch(0.82 0.21 152 / 0.6)" />
            <CategoryCard image={catElectronicsImg} icon={<Laptop className="h-10 w-10" strokeWidth={1.2} />} title="Electronics" desc="Laptops · Phones · Audio · Tablets" tint="from-sky-400/30 to-transparent" accent="oklch(0.78 0.15 220 / 0.6)" />
            <CategoryCard image={catCoolersImg} icon={<Snowflake className="h-10 w-10" strokeWidth={1.2} />} title="Coolers" desc="Portable · Insulated · Mini-fridges" tint="from-cyan-300/30 to-transparent" accent="oklch(0.85 0.13 210 / 0.6)" />
          </div>

        </div>
      </section>

      {/* ── CAMPUS COVERAGE ──────────────────────────────── */}
      <CampusCoverage />

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
            <Step
              n="01"
              icon={<Lock className="h-5 w-5" />}
              title="Prove you're a student"
              body="Sign up with your college email and get a basic 'College email' badge instantly. Want the full blue 'ID Verified' tick? Snap your college ID — a real human on our team checks it within a day."
              meta={<><Clock className="h-3 w-3" /> Get a basic badge in 30 seconds. Full ID verified after manual review.</>}
            />

            <Step
              n="02"
              icon={<Sparkles className="h-5 w-5" />}
              title="List in 90 seconds, or just browse"
              body="Five photos, honest condition, your hostel or block as the meetup zone. Buyers tap Interested and you chat in-app — no phone numbers shared until you choose."
            />
            <Step
              n="03"
              icon={<Zap className="h-5 w-5" />}
              title="Meet on a safe zone. Both confirm."
              body="Trade at one of the marked safe zones on your campus map — library steps, hostel gate, main canteen. Both buyer and seller confirm in the app. Done."
            />
          </div>
        </div>
      </section>

      {/* ── TRUST & SAFETY ───────────────────────────────── */}
      <TrustSafety />

      {/* ── BUILT BY STUDENTS ────────────────────────────── */}
      <BuiltByStudents />

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <Testimonials />

      {/* ── HOW WE MAKE MONEY ────────────────────────────── */}
      <RevenueModel />

      {/* ── WHAT'S NOT ALLOWED ───────────────────────────── */}
      <NotAllowed />

      {/* ── FAQ ──────────────────────────────────────────── */}
      <FAQSection />

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

      <SiteFooter />
    </div>
  );
}

function BuiltByStudents() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
            / Who's behind this
          </span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Built by students,<br />for students.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
            We trade our college IDs on this platform too. That's not marketing —
            that's why every decision starts with "would I trust this with my own
            ID?"
          </p>
        </div>

        <div className="glass-strong glow-ring relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <span className="blob h-64 w-64 -left-12 -top-12 bg-[oklch(0.72_0.18_255/0.4)]" />
          <div className="relative grid items-center gap-10 md:grid-cols-[auto_1fr]">
            <div className="mx-auto md:mx-0">
              <div className="h-40 w-40 overflow-hidden rounded-full ring-2 ring-accent/30 sm:h-48 sm:w-48">
                <img
                  src={rintuAsset.url}
                  alt="Rintu Mahapatra, founder and CEO of UltraOver"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                Founder &amp; CEO
              </span>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Rintu Mahapatra
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-accent" />
                  M.Tech, MNNIT Allahabad
                </span>
              </div>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Rintu got the idea to help juniors make the most of available
                campus resources. UltraOver started as a simple way for verified
                MNNIT students to trade cycles, coolers, and laptops safely on campus.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://www.linkedin.com/in/rintu-mahapatra-385b63300/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button className="h-10 rounded-full bg-foreground px-5 text-background hover:bg-foreground/90">
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                </a>
                <Link to="/about">
                  <Button
                    variant="outline"
                    className="h-10 rounded-full border-white/15 bg-white/[0.04] px-5 hover:bg-white/[0.08]"
                  >
                    Read the full story
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs text-muted-foreground backdrop-blur-xl">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>
                <span className="text-foreground/90 font-medium">Entity registration &amp; DPIIT Startup India recognition</span>
                <span className="ml-1.5">in progress — badges will appear once issued.</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    );
}



function SocialProofBar() {
  const { data } = useSuspenseQuery(homeStatsQuery);
  const preTraction = data.students < 50 && data.listings < 20;
  const students = useCountUp(data.students);
  const listings = useCountUp(data.listings);
  const tradedLakhs = useCountUp(Math.round(data.tradedRupees / 10_000));
  const campuses = useCountUp(data.campuses);
  const hasRealTicker = data.ticker.length > 0;

  if (preTraction) {
    return (
      <section className="relative border-y border-white/5 py-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="liquid-glass rounded-3xl px-6 py-8 text-center sm:px-10 sm:py-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Just launched at MNNIT Allahabad
            </div>
            <p className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              <span className="text-gradient">Be one of the first 50</span>{" "}
              <span className="text-gradient-accent">verified students.</span>
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              We're onboarding students one campus at a time. Real listings and live activity will show up here as your campus comes online.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative border-y border-white/5 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat value={students.toLocaleString("en-IN")} label="Verified students" />
          <Stat value={listings.toLocaleString("en-IN")} label="Active listings" />
          <Stat value={`₹${(tradedLakhs / 10).toFixed(1)}L`} label="Traded this semester" />
          <Stat value={campuses.toString()} label="Campuses live" />
        </div>

        {hasRealTicker && (
          <div className="mt-8 overflow-hidden rounded-full border border-white/10 bg-white/[0.03] py-2.5">
            <div className="marquee">
              <div className="marquee-track text-xs text-muted-foreground sm:text-sm">
                {Array.from({ length: 2 }).map((_, i) => (
                  <span key={i} className="flex shrink-0 items-center gap-10 pr-10">
                    {data.ticker.map((t, j) => (
                      <span key={j} className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {t}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="liquid-glass liquid-stat shine-sweep floating-card group rounded-3xl px-6 py-8 sm:px-7 sm:py-10">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-3 text-4xl font-bold leading-none tracking-tight text-gradient sm:text-5xl lg:text-6xl">{value}</div>
      <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_oklch(0.82_0.21_152)]" />
        Live
      </div>
    </div>
  );
}

function CampusCoverage() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">/ Campuses</span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">Live at MNNIT Allahabad.</span><br />
            <span className="text-gradient-accent">16 campuses launching.</span>
          </h2>
          <p className="mt-5 text-sm text-muted-foreground sm:text-base">
            We launch one campus at a time so every seller is verified, every dispute is local, and every meetup happens on ground you know.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="liquid-glass rounded-3xl p-7">
            <div className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_oklch(0.78_0.18_150)]" />
              Live now
            </div>
            <div className="flex flex-wrap gap-2">
              {LIVE_CAMPUSES.map((c) => (
                <span key={c.name} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-1.5 text-sm font-medium text-foreground backdrop-blur-xl">
                  <img
                    src={campusLogo(c.domain)}
                    alt={`${c.name} logo`}
                    loading="lazy"
                    className="h-5 w-5 rounded-sm bg-white/90 object-contain p-0.5"
                  />
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          <div className="liquid-glass rounded-3xl p-7">
            <div className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_oklch(0.8_0.16_75)]" />
              Launching soon
            </div>
            <div className="flex flex-wrap gap-2">
              {SOON_CAMPUSES.map((c) => (
                <span key={c.name} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-xl">
                  <img
                    src={campusLogo(c.domain)}
                    alt={`${c.name} logo`}
                    loading="lazy"
                    className="h-5 w-5 rounded-sm bg-white/80 object-contain p-0.5 opacity-80"
                  />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>


        <form
          onSubmit={(e) => { e.preventDefault(); }}
          className="liquid-glass mt-8 flex flex-col items-center gap-3 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7"
        >
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">Don't see your college?</p>
            <p className="text-xs text-muted-foreground">Drop your campus email — we launch when 50 students from your campus ask.</p>
          </div>
          <div className="flex w-full max-w-md gap-2">
            <Input
              type="email"
              required
              placeholder="you@yourcollege.ac.in"
              className="h-11 rounded-full border-white/10 bg-white/[0.04] px-5"
            />
            <Button type="submit" className="h-11 shrink-0 rounded-full bg-foreground px-5 text-background hover:bg-foreground/90">
              Request my campus
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function TrustSafety() {
  return (
    <section className="relative border-t border-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">/ Trust &amp; safety</span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">Built for campus.</span><br />
            <span className="text-gradient-accent">Not for strangers.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <TrustCard
            icon={<MapPin className="h-5 w-5" />}
            title="Safe Zones on your campus map"
            body="Every campus has 4–6 admin-approved meetup spots — well-lit, public, near security. Pick one when you confirm a deal. We never recommend hostel rooms or off-campus locations."
          />
          <TrustCard
            icon={<EyeOff className="h-5 w-5" />}
            title="What 'verified' actually means"
            body="Every seller uploads a current college ID matched against a face photo, manually reviewed by our team. We store the ID encrypted, never share it, and delete it the day you graduate."
          />
          <TrustCard
            icon={<LifeBuoy className="h-5 w-5" />}
            title="If something goes wrong"
            body="Report a listing or a user in two taps. Our campus moderators (senior students at your college) respond within 4 hours. Confirmed scammers are banned forever — across every campus we run."
          />
        </div>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/30 bg-gradient-to-r from-amber-300/10 via-amber-200/5 to-amber-300/10 px-6 py-3 text-sm font-medium text-amber-100 backdrop-blur-xl">
            <ShieldCheck className="h-4 w-4 text-amber-300" />
            <span>
              <span className="text-amber-200">Zero reported fraud cases in 14 months.</span>
              <span className="ml-2 text-muted-foreground">Every dispute resolved on-campus, in person.</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="floating-card liquid-glass group relative overflow-hidden rounded-2xl p-8">
      <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-accent">
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

const TESTIMONIALS = [
  {
    quote: "Sold my second-year cycle in 40 minutes — to a fresher in the next hostel. Zero haggling drama, met at the library steps.",
    name: "Aarav Sharma",
    course: "B.Tech CSE, 3rd year",
    college: "MNNIT Allahabad",
  },
  {
    quote: "I'd been scammed twice on Facebook Marketplace before. Verified-only changed everything — the laptop I bought came with the original box.",
    name: "Priya Menon",
    course: "B.Tech ECE, 2nd year",
    college: "MNNIT Allahabad",
  },
  {
    quote: "Listed my old cooler on a Sunday night. Confirmed sale by Monday lunch. Both of us literally live in the same block.",
    name: "Rohan Kapoor",
    course: "M.Tech Mechanical, 1st year",
    college: "MNNIT Allahabad",
  },
  {
    quote: "Got my GATE prep books for almost half the price from a passing-out senior. He even threw in his handwritten notes.",
    name: "Sneha Iyer",
    course: "B.Tech IT, 4th year",
    college: "MNNIT Allahabad",
  },
  {
    quote: "The escrow option made me trust paying ₹18,000 for a used iPad sight-unseen. Money only moved after I unboxed it in front of the seller.",
    name: "Karthik Reddy",
    course: "B.Arch, 3rd year",
    college: "MNNIT Allahabad",
  },
  {
    quote: "Best part is everyone here is on the same campus. No shipping anxiety, no fake profiles. Just walk over and pick it up.",
    name: "Ananya Gupta",
    course: "B.Tech Civil, 2nd year",
    college: "MNNIT Allahabad",
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function Testimonials() {
  return (
    <section className="relative border-t border-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">/ From the campus</span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">Students who've</span><br />
            <span className="text-gradient-accent">already traded.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="floating-card liquid-glass relative overflow-hidden rounded-2xl p-8">
              <div className="text-4xl leading-none text-accent/60">"</div>
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">{t.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                <div
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold tracking-tight text-accent ring-1 ring-accent/25"
                >
                  {initials(t.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold tracking-tight">{t.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-accent/80">
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                    Verified buyer
                  </div>
                  <div className="mt-1 truncate text-[11px] text-muted-foreground">
                    {t.course} · {t.college}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const REVENUE_ITEMS = [
  {
    title: "Free, forever",
    body: "Listing, browsing, chatting, and meeting on campus stays free. No commission. No subscription. No 'unlock contact' fee.",
    tag: "Free",
  },
  {
    title: "Hostel-to-hostel delivery",
    body: "Optional. When you don't want to meet, a verified runner brings the item to your hostel gate. Small flat fee paid by the buyer.",
    tag: "Optional · Paid",
  },
  {
    title: "UltraProtect escrow",
    body: "Optional. We hold the payment until both buyer and seller confirm the meetup. Small buyer-side fee. Recommended for ₹5,000+ items.",
    tag: "Optional · Paid",
  },
  {
    title: "Verified shops & boosts",
    body: "Local cycle-repair and refurb partners pay to appear. Verified sellers can boost a listing once a week — never spammy, always labelled.",
    tag: "Optional · Paid",
  },
];

function RevenueModel() {
  return (
    <section className="relative border-t border-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">/ How we make money</span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">Free where it matters.</span><br />
            <span className="text-gradient-accent">Paid only if you opt in.</span>
          </h2>
          <p className="mt-5 text-sm text-muted-foreground sm:text-base">
            We'll never take a cut of a student-to-student sale. Here's the full list of things we charge for — and they're all optional.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {REVENUE_ITEMS.map((r) => (
            <div key={r.title} className="floating-card liquid-glass relative overflow-hidden rounded-2xl p-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {r.tag}
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{r.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const ALLOWED = ["Cycles & e-cycles", "Laptops, phones, tablets", "Headphones, monitors, peripherals", "Coolers & mini-fridges", "Kitchen appliances", "Calculators & lab kits"];
const NOT_ALLOWED = ["Anything illegal or counterfeit", "Items you don't personally own", "Exam papers, assignments, solved sets", "Pets or live animals", "Cash-equivalent items (gift cards, crypto)", "Services, freelancing, tuitions"];

function NotAllowed() {
  return (
    <section className="relative border-t border-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">/ House rules</span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">What you can &amp;</span><br />
            <span className="text-gradient-accent">can't list.</span>
          </h2>
          <p className="mt-5 text-sm text-muted-foreground sm:text-base">
            Clear rules mean fewer disputes. Listings outside this list are removed within hours — repeat offenders are banned across every campus we run.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="liquid-glass rounded-3xl p-7">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Allowed
            </div>
            <ul className="space-y-2.5 text-sm text-foreground/90">
              {ALLOWED.map((a) => (
                <li key={a} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="liquid-glass rounded-3xl p-7">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-rose-300">
              <EyeOff className="h-4 w-4" /> Not allowed
            </div>
            <ul className="space-y-2.5 text-sm text-foreground/90">
              {NOT_ALLOWED.map((a) => (
                <li key={a} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}


function FAQSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">/ FAQ</span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-gradient">Questions students</span> <span className="text-gradient-accent">actually ask.</span>
          </h2>
        </div>

        <div className="liquid-glass rounded-3xl px-6 py-2 sm:px-8">
          <Accordion type="single" collapsible defaultValue="item-3" className="w-full">
            {FAQ_ITEMS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                <AccordionTrigger className="py-5 text-left text-base font-semibold tracking-tight hover:no-underline sm:text-lg">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="relative border-t border-white/5 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="text-xl font-bold tracking-tight text-gradient">UltraOver</div>
            <p className="mt-3 max-w-xs text-xs text-muted-foreground">
              The campus marketplace built on trust. Made by students, in India. 🇮🇳
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { href: "https://instagram.com/ultraover", icon: Instagram, label: "Instagram" },
                { href: "https://x.com/ultraover", icon: Twitter, label: "X" },
                { href: "https://linkedin.com/company/ultraover", icon: Linkedin, label: "LinkedIn" },
                { href: "https://youtube.com/@ultraover", icon: Youtube, label: "YouTube" },
                { href: "mailto:hello@ultraover.com", icon: Mail, label: "Email" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Marketplace" items={[
            { label: "Browse all", to: "/browse" },
            { label: "Cycles", to: "/browse" },
            { label: "Electronics", to: "/browse" },
            { label: "Coolers", to: "/browse" },
            { label: "Sell something", to: "/sell" },
            { label: "My orders", to: "/me" },
          ]} />

          <FooterCol title="Campuses" items={[
            ...LIVE_CAMPUSES.map((c) => ({ label: c.name, to: "/browse" as const })),
            { label: "Request your campus →", to: "/" as const },
          ]} />

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Help &amp; legal</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a className="hover:text-foreground" href="#how-it-works">How it works</a></li>
              <li><a className="hover:text-foreground" href="#trust">Trust &amp; safety</a></li>
              <li><Link className="hover:text-foreground" to="/support">Contact support</Link></li>
              <li><Link className="hover:text-foreground" to="/about">About &amp; founder</Link></li>
              <li><Link className="hover:text-foreground" to="/terms">Terms of service</Link></li>
              <li><Link className="hover:text-foreground" to="/privacy">Privacy policy</Link></li>
              <li><Link className="hover:text-foreground" to="/refunds">Refunds &amp; UltraProtect</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-[11px] text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} UltraOver · A peer-to-peer campus marketplace</span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Verified students only · v0.2 ·
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All systems normal
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: "/" | "/browse" | "/sell" | "/me" }[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">{title}</div>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((it) => (
          <li key={it.label}>
            <Link to={it.to} className="hover:text-foreground">{it.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryCard({ image, icon, title, desc, tint, accent }: { image?: string; icon: React.ReactNode; title: string; desc: string; tint: string; accent?: string }) {
  return (
    <Link to="/browse" className="floating-card shine-sweep group relative block overflow-hidden rounded-3xl border border-white/10 bg-card">
      <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${tint}`}>
        {image && (
          <img
            src={image}
            alt={`${title} category`}
            loading="lazy"
            width={1024}
            height={1280}
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-[1400ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-110"
          />
        )}
        {/* liquid color wash */}
        <div
          className="absolute -inset-10 opacity-70 mix-blend-screen transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(60% 50% at 70% 20%, ${accent ?? "oklch(0.82 0.21 152 / 0.5)"}, transparent 70%), radial-gradient(50% 40% at 20% 80%, oklch(0.78 0.15 220 / 0.35), transparent 70%)`,
            filter: "blur(30px)",
          }}
        />
        {/* icon top-right */}
        <div className="absolute right-0 top-0 flex items-start justify-end p-7 text-foreground/85 transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-1 group-hover:scale-110">
          {icon}
        </div>
        {/* bottom dark fade for legible text */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-7">
        <h3 className="text-3xl font-bold tracking-tight text-gradient">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-accent backdrop-blur-xl transition-all duration-500 group-hover:bg-white/[0.12]">
          Explore <ArrowRight className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function HeroStat({
  icon,
  value,
  target,
  label,
}: {
  icon: React.ReactNode;
  value?: string;
  target?: number;
  label: string;
}) {
  const animated = useCountUp(target ?? 0);
  const display =
    value ?? (target == null ? null : animated.toLocaleString("en-IN"));
  return (
    <div className="liquid-stat shine-sweep group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20">
      <div className="flex items-center gap-2 text-accent">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      </div>
      {display == null ? (
        <div className="mt-3 h-9 w-24 animate-pulse rounded-md bg-white/10" />
      ) : (
        <div className="mt-3 text-3xl font-bold leading-none tracking-tight text-gradient sm:text-4xl">{display}</div>
      )}
    </div>
  );
}



function Step({ n, icon, title, body, meta }: { n: string; icon: React.ReactNode; title: string; body: string; meta?: React.ReactNode }) {
  return (
    <div className="floating-card liquid-glass group relative overflow-hidden rounded-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-medium tracking-[0.2em] text-accent">{n}</span>
        <span className="text-muted-foreground transition-colors group-hover:text-accent">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      {meta && (
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-[11px] font-medium text-emerald-300">
          {meta}
        </div>
      )}
    </div>
  );
}
