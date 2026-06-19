import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import {
  MessageCircle,
  Send,
  Mail,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — UltraOver" },
      { name: "description", content: "Contact UltraOver support via WhatsApp, Telegram, or email. We reply within 4 hours, Monday to Saturday." },
      { property: "og:title", content: "Support — UltraOver" },
      { property: "og:description", content: "Contact UltraOver support via WhatsApp, Telegram, or email. We reply within 4 hours, Monday to Saturday." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        <div className="mb-10 border-b border-white/10 pb-8">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">Help</span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">Contact support</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Something not right? We’re students too — we get it. Reach out however you prefer and we’ll sort it out.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">WhatsApp</h3>
                <p className="text-xs text-muted-foreground">Fastest for urgent issues</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              Open chat <ExternalLink className="h-3 w-3" />
            </span>
          </a>

          <a
            href="https://t.me/ultraover_support"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Telegram</h3>
                <p className="text-xs text-muted-foreground">Good for detailed queries</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-sky-400">
              Open chat <ExternalLink className="h-3 w-3" />
            </span>
          </a>

          <a
            href="mailto:hello@ultraover.com"
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.06] sm:col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Email</h3>
                <p className="text-xs text-muted-foreground">hello@ultraover.com</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
              Send email <ExternalLink className="h-3 w-3" />
            </span>
          </a>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-sm font-semibold">What to include</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>Your registered college email or phone number</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>Order or listing ID (if it’s about a transaction)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>Screenshots help us fix bugs faster</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-400/5 px-4 py-3 text-[11px] text-emerald-300">
          <Clock className="h-4 w-4 shrink-0" />
          <span>We reply within 4 hours, Mon–Sat. Sundays we’re probably cycling or cramming for exams — you understand.</span>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 text-xs">
          <Link
            to="/terms"
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            Terms of service
          </Link>
          <Link
            to="/privacy"
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy policy
          </Link>
          <Link
            to="/refunds"
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            Refunds & UltraProtect
          </Link>
        </div>
      </main>
    </div>
  );
}
