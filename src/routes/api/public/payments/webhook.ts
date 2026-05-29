import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

const COMMISSION_RATE = 0.037;

let _admin: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _admin;
}

async function handleCheckoutCompleted(session: any) {
  const meta = session.metadata ?? {};
  const listingId = meta.listing_id;
  const buyerId = meta.buyer_id;
  const sellerId = meta.seller_id;
  if (!listingId || !buyerId || !sellerId) {
    console.error("Missing metadata on checkout session", session.id);
    return;
  }

  const admin = getAdmin();

  const amountTotalMinor = session.amount_total ?? 0;
  const amountPaid = amountTotalMinor / 100; // INR (paise -> rupees)
  const commission = Math.round(amountPaid * COMMISSION_RATE * 100) / 100;
  const payout = Math.round((amountPaid - commission) * 100) / 100;

  await admin.from("orders").upsert(
    {
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount_paid: amountPaid,
      commission_amount: commission,
      seller_payout_amount: payout,
      currency: session.currency ?? "inr",
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      status: "paid",
      payout_status: "pending",
      buyer_contact_email: session.customer_details?.email ?? null,
      buyer_contact_phone: meta.contact_phone ?? null,
      delivery_address: meta.delivery_address ?? null,
    },
    { onConflict: "stripe_session_id" },
  );

  // Mark the listing as sold so it disappears from browse.
  await admin
    .from("listings")
    .update({ status: "sold" })
    .eq("id", listingId);
}

async function handleRefunded(charge: any) {
  const pi =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!pi) return;
  await getAdmin()
    .from("orders")
    .update({ status: "refunded", payout_status: "hold" })
    .eq("stripe_payment_intent", pi);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "charge.refunded":
      await handleRefunded(event.data.object);
      break;
    default:
      console.log("Unhandled stripe event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
