import { useState } from "react";
import {
  LifeBuoy,
  X,
  MessageCircle,
  Send,
  Mail,
  Clock,
  ExternalLink,
} from "lucide-react";

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating trigger — liquid emerald glass orb with circular text */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close help panel" : "Open help panel"}
        className="help-orb fixed bottom-6 right-6 z-50"
      >
        {/* Rotating circular text */}
        <div className="help-orb-ring" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <path
                id="helpTextPath"
                d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
              />
            </defs>
            <text className="help-orb-text">
              <textPath href="#helpTextPath" startOffset="0%">
                Any Help Needed? • Any Help Needed? •
              </textPath>
            </text>
          </svg>
        </div>

        {/* Glow halo */}
        <div className="help-orb-glow" aria-hidden="true" />

        {/* Glass body */}
        <div className="help-orb-body">
          {open ? (
            <X className="help-orb-icon h-7 w-7" />
          ) : (
            <LifeBuoy className="help-orb-icon h-7 w-7" />
          )}
        </div>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#12121a]/95 backdrop-blur-xl shadow-2xl">
          <div className="p-5">
            <h3 className="text-sm font-semibold tracking-tight">Need help?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Reach out however you prefer. We’re students too.
            </p>

            <div className="mt-4 space-y-2.5">
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-3 text-sm transition-colors hover:bg-white/[0.06]"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span className="flex-1">WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>

              <a
                href="https://t.me/ultraover_support"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-3 text-sm transition-colors hover:bg-white/[0.06]"
              >
                <Send className="h-4 w-4 text-sky-400" />
                <span className="flex-1">Telegram</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>

              <a
                href="mailto:hello@ultraover.com"
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-3 text-sm transition-colors hover:bg-white/[0.06]"
              >
                <Mail className="h-4 w-4 text-amber-400" />
                <span className="flex-1">hello@ultraover.com</span>
              </a>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-400/5 px-3 py-2.5 text-[11px] text-emerald-300">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>We reply within 4 hours, Mon–Sat</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
