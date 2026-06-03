import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/razorpay.server";

const COMMISSION_RATE = 0.037;

let _admin: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  if (!_admin) {
    _admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _admin;
}

async function handlePaymentCaptured(payment: any) {
  const notes = payment.notes ?? {};
  const listingId = notes.listing_id;
  const buyerId = notes.buyer_id;
  const sellerId = notes.seller_id;
  if (!listingId || !buyerId || !sellerId) {
    console.error("Razorpay webhook missing notes", payment.id);
    return;
  }
  const amountPaid = (payment.amount ?? 0) / 100;
  const commission = Math.round(amountPaid * COMMISSION_RATE * 100) / 100;
  const payout = Math.round((amountPaid - commission) * 100) / 100;
  const admin = getAdmin();

  await (admin.from("orders") as any).upsert(
    {
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount_paid: amountPaid,
      commission_amount: commission,
      seller_payout_amount: payout,
      currency: (payment.currency ?? "INR").toLowerCase(),
      razorpay_order_id: payment.order_id,
      razorpay_payment_id: payment.id,
      status: "paid",
      payout_status: "pending",
      buyer_contact_phone: notes.contact_phone ?? null,
      delivery_address: notes.delivery_address ?? null,
      buyer_contact_email: notes.buyer_email ?? payment.email ?? null,
    },
    { onConflict: "razorpay_order_id" },
  );

  await (admin.from("listings") as any).update({ status: "sold" }).eq("id", listingId);
}

async function handleRefunded(payment: any) {
  if (!payment?.id) return;
  await (getAdmin().from("orders") as any)
    .update({ status: "refunded", payout_status: "hold" })
    .eq("razorpay_payment_id", payment.id);
}

export const Route = createFileRoute("/api/public/payments/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("x-razorpay-signature");
        const body = await request.text();
        const ok = await verifyWebhookSignature(body, signature);
        if (!ok) return new Response("Invalid signature", { status: 401 });
        try {
          const event = JSON.parse(body) as { event: string; payload: any };
          switch (event.event) {
            case "payment.captured":
              await handlePaymentCaptured(event.payload?.payment?.entity);
              break;
            case "payment.refunded":
            case "refund.processed":
              await handleRefunded(event.payload?.payment?.entity ?? event.payload?.refund?.entity);
              break;
            default:
              // ignore others
              break;
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("Razorpay webhook error", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
