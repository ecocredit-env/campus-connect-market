import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalShell } from "@/components/LegalShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — UltraOver" },
      { name: "description", content: "How UltraOver collects, encrypts, and deletes student data — including college ID verification." },
      { property: "og:title", content: "Privacy Policy — UltraOver" },
      { property: "og:description", content: "How UltraOver collects, encrypts, and deletes student data — including college ID verification." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 17, 2026" intro="UltraOver only works because students trust us with their identity. This page explains exactly what we collect, where it lives, who can see it, and when it's deleted.">
      <Section title="1. What we collect">
        <ul className="ml-5 list-disc space-y-1.5">
          <li><strong>Account:</strong> name, email, phone, campus, year of study, profile photo.</li>
          <li><strong>Listings:</strong> photos, titles, descriptions, prices, and chat messages tied to a listing.</li>
          <li><strong>Transactions:</strong> escrow records, payout bank/UPI handle (not full account number), Razorpay payment IDs.</li>
          <li><strong>Verification:</strong> a single image of your college ID card plus campus-issued email. See section 3.</li>
          <li><strong>Device &amp; usage:</strong> IP, browser, OS, pages visited — used only for security and product analytics.</li>
        </ul>
      </Section>

      <Section title="2. What we do not collect">
        <p>We do not collect your Aadhaar, PAN, CGPA, attendance, location history, contacts list, or biometric data. We do not buy data from third parties. We do not have any access to your camera roll, SMS, or call logs.</p>
      </Section>

      <Section title="3. College ID verification — how it works">
        <p>To list or buy on UltraOver you submit one photo of a valid student ID card and verify a campus-issued email (e.g. <em>@iitb.ac.in</em>). Here's exactly what happens to that data:</p>
        <ul className="ml-5 mt-3 list-disc space-y-1.5">
          <li><strong>At upload:</strong> the image is transmitted over TLS 1.3 and written to a private, RLS-protected storage bucket. Only your account can read it back.</li>
          <li><strong>At rest:</strong> stored encrypted with AES-256 server-side. The bucket is not public. URLs are short-lived signed URLs only generated for our trust &amp; safety reviewers.</li>
          <li><strong>Who sees it:</strong> a small, audited trust &amp; safety team during the initial verification check and any subsequent fraud investigation. Sellers, buyers, and other students never see your ID — they see your verified badge, name, and campus only.</li>
          <li><strong>Auto-deletion:</strong> the raw ID image is deleted within <strong>30 days</strong> of successful verification. We keep only a SHA-256 hash and verification timestamp so we can prove the check happened without storing the document.</li>
          <li><strong>On failure or rejection:</strong> the image is deleted within 7 days regardless of outcome.</li>
          <li><strong>On account closure:</strong> any remaining ID data, profile photo, and chats are purged within 14 days, except minimal records we are legally required to retain (e.g. tax records for completed transactions).</li>
        </ul>
      </Section>

      <Section title="4. How we use your data">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Run the marketplace — show listings, route escrow, send notifications.</li>
          <li>Verify you're a real student on a real campus.</li>
          <li>Detect and stop fraud, scams, or harassment.</li>
          <li>Improve the product with aggregated analytics. We never sell your personal data.</li>
        </ul>
      </Section>

      <Section title="5. Who we share with">
        <p>Only the processors required to run UltraOver: <strong>Lovable Cloud</strong> (database, auth, storage), <strong>Razorpay</strong> (payments &amp; payouts), and our transactional email provider. Each has its own security review and is contractually bound to handle your data only on our instructions. We disclose data to law enforcement only when compelled by a valid Indian legal request.</p>
      </Section>

      <Section title="6. Your rights">
        <p>You can view and edit your profile from <Link to="/profile" className="underline hover:text-foreground">/profile</Link>. You can request a full data export or permanent deletion of your account by emailing <a href="mailto:privacy@ultraover.com" className="underline hover:text-foreground">privacy@ultraover.com</a> from your registered email. We respond within 7 working days.</p>
      </Section>

      <Section title="7. Cookies">
        <p>We use first-party cookies for session login and CSRF protection only. No third-party advertising cookies, no cross-site trackers, no Facebook Pixel.</p>
      </Section>

      <Section title="8. Children">
        <p>UltraOver is for students aged 18 and above. We do not knowingly collect data from anyone under 18.</p>
      </Section>

      <Section title="9. Changes">
        <p>Material changes to this policy get an in-app notice 14 days before taking effect.</p>
      </Section>

      <Section title="Contact">
        <p>Privacy questions: <a href="mailto:privacy@ultraover.com" className="underline hover:text-foreground">privacy@ultraover.com</a> · Data Protection Officer: Aarav Mehta.</p>
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
