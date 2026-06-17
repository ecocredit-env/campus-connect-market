import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalShell } from "@/components/LegalShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — UltraOver" },
      { name: "description", content: "The rules for using UltraOver, India's verified student campus marketplace." },
      { property: "og:title", content: "Terms of Service — UltraOver" },
      { property: "og:description", content: "The rules for using UltraOver, India's verified student campus marketplace." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="June 17, 2026" intro="By creating an account or using UltraOver, you agree to these terms. Read them carefully — they cover what you can list, how escrow works, and what happens when things go wrong.">
      <Section title="1. Who can use UltraOver">
        <p>UltraOver is only for currently enrolled students at supported Indian campuses. You must be 18+ and verify your college ID before listing or buying. One account per student. Sharing accounts, faking your campus, or using someone else's ID will get you permanently banned with no refund of pending payouts.</p>
      </Section>
      <Section title="2. What you can list">
        <p>Personal pre-owned items only — cycles, electronics, books, hostel essentials, instruments, sports gear, and similar campus goods. <strong>Not allowed:</strong> weapons, drugs, prescription medication, alcohol, tobacco, vapes, exam material, completed assignments, ID cards, SIM cards, live animals, counterfeit goods, stolen property, anything illegal under Indian law, or any service-for-cash arrangements. We remove violating listings without notice.</p>
      </Section>
      <Section title="3. Listings and pricing">
        <p>You're responsible for the accuracy of your listing — photos, title, description, condition, and price must reflect the actual item. You may not list items you don't physically own. Prices are in INR and include all charges to the buyer except meetup logistics. We may remove listings that are misleading, duplicate, or priced to manipulate the market.</p>
      </Section>
      <Section title="4. UltraProtect escrow">
        <p>Every transaction runs through UltraProtect. The buyer pays into escrow, the seller hands over the item at a verified campus meetup, and the buyer has 24 hours to confirm. Funds release to the seller's payout account on confirmation or after the 24-hour window if no dispute is raised. See the <Link to="/refunds" className="underline hover:text-foreground">Refund &amp; dispute policy</Link> for what's covered.</p>
      </Section>
      <Section title="5. Fees">
        <p>UltraOver charges a flat 4% platform fee on the final sale price, deducted from the seller's payout. Buyers pay no platform fee. Payment-gateway charges are included. We'll give 30 days' notice in-app before any fee change.</p>
      </Section>
      <Section title="6. Conduct">
        <p>No harassment, hate speech, doxxing, spam, scraping, or off-platform payments. Don't pressure buyers or sellers to bypass UltraProtect — doing so voids all dispute protection and is grounds for a permanent ban. Report anything off to <a href="mailto:report@ultraover.com" className="underline hover:text-foreground">report@ultraover.com</a>.</p>
      </Section>
      <Section title="7. Account suspension">
        <p>We may suspend or terminate accounts for policy violations, suspected fraud, chargebacks, or repeated disputes. You can close your account anytime from Profile → Settings. Pending escrow transactions complete before closure.</p>
      </Section>
      <Section title="8. Liability">
        <p>UltraOver is a peer-to-peer marketplace. We verify identity and operate escrow, but we are not the seller of items listed. We don't warrant item quality beyond what's covered by UltraProtect. To the maximum extent allowed by law, our liability for any claim is capped at the platform fee we collected on the disputed transaction.</p>
      </Section>
      <Section title="9. Changes to these terms">
        <p>We may update these terms as the product evolves. Material changes get 14 days' in-app notice before taking effect. Continued use after that date means you accept the updated terms.</p>
      </Section>
      <Section title="10. Governing law">
        <p>These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts at Bengaluru, Karnataka.</p>
      </Section>
      <Section title="Contact">
        <p>Questions? <a href="mailto:hello@ultraover.com" className="underline hover:text-foreground">hello@ultraover.com</a></p>
      </Section>
    </LegalShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
