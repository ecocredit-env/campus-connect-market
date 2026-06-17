import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalShell } from "@/components/LegalShell";
import { CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refunds & UltraProtect — UltraOver" },
      { name: "description", content: "What's covered under UltraProtect escrow, how to raise a dispute, and how refunds are processed." },
      { property: "og:title", content: "Refunds & UltraProtect — UltraOver" },
      { property: "og:description", content: "What's covered under UltraProtect escrow, how to raise a dispute, and how refunds are processed." },
    ],
  }),
  component: RefundsPage,
});

const COVERAGE: { case: string; covered: boolean; detail: string }[] = [
  { case: "Item never handed over at meetup", covered: true, detail: "Full refund within 24 hours. Seller payout cancelled." },
  { case: "Item differs materially from listing (wrong model, broken, fake)", covered: true, detail: "Full refund after evidence review (photos + chat). Decision within 48 hours." },
  { case: "Stolen or counterfeit goods discovered post-purchase", covered: true, detail: "Full refund + seller permanently banned." },
  { case: "Item dead-on-arrival electronics within 24 hours", covered: true, detail: "Full refund. Buyer ships item back to seller at platform cost." },
  { case: "Seller no-show at scheduled meetup", covered: true, detail: "Full refund auto-released after 6 hours." },
  { case: "Buyer changed their mind after confirming receipt", covered: false, detail: "Not eligible. Confirmation is final." },
  { case: "Cosmetic wear consistent with the listed condition", covered: false, detail: "Not eligible. Condition was disclosed." },
  { case: "Damage caused after buyer accepted the item", covered: false, detail: "Not eligible." },
  { case: "Off-platform payments (UPI direct, cash outside meetup)", covered: false, detail: "Never eligible. UltraProtect only applies to in-app escrow." },
  { case: "Lost shipment (UltraOver is meetup-only)", covered: false, detail: "Not applicable — we don't support shipping." },
];

function RefundsPage() {
  return (
    <LegalShell title="Refunds & UltraProtect" updated="June 17, 2026" intro="UltraProtect is the escrow layer behind every UltraOver sale. Money sits with us until the buyer confirms the item is exactly as listed. Here's what's covered and how to raise a dispute.">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">How escrow works</h2>
        <ol className="ml-5 list-decimal space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <li>Buyer pays — funds are held by UltraProtect, not sent to the seller.</li>
          <li>Both parties confirm a campus meetup (time + verified location).</li>
          <li>Buyer inspects the item in person.</li>
          <li>Buyer taps <em>Confirm receipt</em> in the app → seller payout starts within 2 hours.</li>
          <li>If the buyer doesn't act, funds auto-release after 24 hours.</li>
          <li>If the buyer raises a dispute within 24 hours, funds stay frozen until trust &amp; safety reviews.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Coverage table</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Scenario</th>
                <th className="px-4 py-3 font-medium">Covered</th>
                <th className="px-4 py-3 font-medium">What happens</th>
              </tr>
            </thead>
            <tbody>
              {COVERAGE.map((row) => (
                <tr key={row.case} className="border-t border-white/5 align-top">
                  <td className="px-4 py-3 text-foreground">{row.case}</td>
                  <td className="px-4 py-3">
                    {row.covered ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <XCircle className="h-4 w-4" /> No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Raising a dispute</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Open the order in <Link to="/me" className="underline hover:text-foreground">My Stuff</Link>, tap <em>Raise dispute</em>, and upload clear photos plus a short description. You must raise the dispute within <strong>24 hours</strong> of the meetup. Our trust &amp; safety team reviews evidence and chat history and decides within <strong>48 hours</strong>. Refunds land on the original payment method within 5–7 working days after a decision.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Cancellations before meetup</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Either party can cancel before the scheduled meetup with no penalty for the first cancellation. Buyers get a full refund immediately. Repeated last-minute cancellations may temporarily restrict your account.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">What voids UltraProtect</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Any payment made outside the app — UPI direct, cash before confirmation, or splitting the transaction across platforms — voids all UltraProtect coverage. We can't refund money we never held.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Contact</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Dispute help: <a href="mailto:disputes@ultraover.com" className="underline hover:text-foreground">disputes@ultraover.com</a> · General: <a href="mailto:hello@ultraover.com" className="underline hover:text-foreground">hello@ultraover.com</a></p>
      </section>
    </LegalShell>
  );
}
