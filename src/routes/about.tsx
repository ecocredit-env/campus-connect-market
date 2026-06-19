import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Linkedin, GraduationCap, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import rintuAsset from "@/assets/rintu-mahapatra.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About UltraOver — Built by students, for students" },
      {
        name: "description",
        content:
          "UltraOver is a campus marketplace founded by Rintu Mahapatra to make student-to-student trade safe, verified, and zero-fee.",
      },
      { property: "og:title", content: "About UltraOver — Built by students, for students" },
      {
        property: "og:description",
        content:
          "Meet the student founder behind UltraOver and the story of why a verified, safe-zone marketplace had to exist.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-28 pb-24">
        <section className="text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
            / About UltraOver
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gradient sm:text-6xl">
            Built by students,
            <br />
            for students.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            We're not a startup studio chasing a "Gen-Z vertical." We're students who got
            burnt on Facebook Marketplace, watched seniors disappear from college WhatsApp
            groups after graduation, and decided trading inside a hostel deserved better
            infrastructure than a stranger and a hope.
          </p>
        </section>

        <section className="mt-20">
          <div className="glass-strong glow-ring relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
              <div className="mx-auto md:mx-0">
                <div className="relative">
                  <span className="blob h-56 w-56 -left-6 -top-6 bg-[oklch(0.72_0.18_255/0.45)]" />
                  <div className="relative h-44 w-44 overflow-hidden rounded-full ring-2 ring-accent/30 sm:h-56 sm:w-56">
                    <img
                      src={rintuAsset.url}
                      alt="Rintu Mahapatra, founder and CEO of UltraOver"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                  Founder &amp; CEO
                </span>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Rintu Mahapatra
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-accent" />
                    B.Tech, MNNIT Allahabad
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-accent" />
                    Prayagraj, India
                  </span>
                </div>

                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  In his first semester, Rintu lost ₹6,800 to a "senior" on a college
                  resale group who turned out to be a reseller with three fake profiles.
                  UltraOver started that night as a spreadsheet of verified MNNIT students
                  trading cycles and coolers — and grew into a campus marketplace where
                  every seller is ID-verified and every meetup happens at a marked safe
                  zone.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="https://www.linkedin.com/in/rintu-mahapatra-385b63300/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      size="lg"
                      className="h-11 rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
                    >
                      <Linkedin className="mr-2 h-4 w-4" />
                      Connect on LinkedIn
                    </Button>
                  </a>
                  <a href="mailto:rintu@ultraover.com">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-11 rounded-full border-white/15 bg-white/[0.04] px-5 hover:bg-white/[0.08]"
                    >
                      rintu@ultraover.com
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          <ValueCard
            title="Verified students only"
            body="No dealers, no aunties with three phones — every seller's college ID is matched to their face before they can list."
          />
          <ValueCard
            title="Zero commission, ever"
            body="We don't take a cut of student-to-student sales. When we monetise, it'll never be by skimming your dorm-room economy."
          />
          <ValueCard
            title="Safe-zone meetups"
            body="Every campus has marked drop points — library steps, hostel gate, main canteen. Both parties confirm in-app. Done."
          />
        </section>

        <section className="mt-16">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Operating as UltraOver · A student-founded peer-to-peer marketplace
            </span>
            <p className="mt-3 text-xs text-muted-foreground">
              Entity registration and DPIIT Startup India recognition in progress — badges
              will appear here once issued.
            </p>
          </div>
        </section>

        <section className="mt-16 text-center">
          <Link to="/signup">
            <Button
              size="lg"
              className="h-12 rounded-full bg-foreground px-7 text-background hover:bg-foreground/90"
            >
              Join UltraOver
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="floating-card liquid-glass rounded-2xl p-6">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
