import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

const COMMISSION_RATE = 0.037; // 3.7%

type CheckoutResult = { clientSecret: string } | { error: string };

export const createListingCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    listingId: string;
    deliveryAddress: string;
    contactPhone: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.listingId)) throw new Error("Invalid listing id");
    if (!data.deliveryAddress || data.deliveryAddress.length < 5)
      throw new Error("Delivery address required");
    if (!data.contactPhone || data.contactPhone.length < 6)
      throw new Error("Contact phone required");
    return data;
  })
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const { supabase, userId } = context;

      const { data: listing, error: lErr } = await supabase
        .from("listings")
        .select("id, seller_id, title, price, status, delivery_charge_note, category, photos")
        .eq("id", data.listingId)
        .maybeSingle();
      if (lErr || !listing) return { error: "Listing not found" };
      if (listing.status !== "active") return { error: "Listing is no longer available" };
      if (listing.seller_id === userId) return { error: "You cannot buy your own listing" };

      const { data: { user } } = await supabase.auth.getUser();
      const buyerEmail = user?.email ?? undefined;

      const stripe = createStripeClient(data.environment);

      const priceInPaise = Math.round(Number(listing.price) * 100);
      const image = Array.isArray(listing.photos) && listing.photos[0] ? [listing.photos[0]] : undefined;

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: listing.title.slice(0, 250),
                ...(image && { images: image }),
              },
              unit_amount: priceInPaise,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        ...(buyerEmail && { customer_email: buyerEmail }),
        payment_intent_data: {
          description: listing.title.slice(0, 200),
          ...(buyerEmail && { receipt_email: buyerEmail }),
          metadata: {
            listing_id: listing.id,
            buyer_id: userId,
            seller_id: listing.seller_id,
          },
        },
        metadata: {
          listing_id: listing.id,
          buyer_id: userId,
          seller_id: listing.seller_id,
          delivery_address: data.deliveryAddress.slice(0, 500),
          contact_phone: data.contactPhone.slice(0, 30),
        },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      console.error("createListingCheckout error", error);
      return { error: getStripeErrorMessage(error) };
    }
  });

export const requestRefund = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string; reason: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.orderId)) throw new Error("Invalid order id");
    if (!data.reason || data.reason.length < 5) throw new Error("Reason too short");
    if (data.reason.length > 1000) throw new Error("Reason too long");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("refund_requests").insert({
      order_id: data.orderId,
      buyer_id: userId,
      reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listRefundRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdminRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");
    if (!isAdminRows || isAdminRows.length === 0) throw new Error("Forbidden");

    const { data, error } = await supabase
      .from("refund_requests")
      .select("id, order_id, buyer_id, reason, status, admin_notes, created_at, orders(amount_paid, listing_id, seller_id, stripe_payment_intent)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const decideRefund = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    refundRequestId: string;
    approve: boolean;
    notes?: string;
    environment: StripeEnv;
  }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.refundRequestId)) throw new Error("Invalid id");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdminRows } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin");
    if (!isAdminRows || isAdminRows.length === 0) throw new Error("Forbidden");

    const admin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: rr, error: rrErr } = await admin
      .from("refund_requests")
      .select("id, order_id, status")
      .eq("id", data.refundRequestId)
      .maybeSingle();
    if (rrErr || !rr) throw new Error("Refund request not found");
    if (rr.status !== "pending") throw new Error("Already decided");

    if (data.approve) {
      const { data: order } = await admin
        .from("orders")
        .select("id, stripe_payment_intent, status")
        .eq("id", rr.order_id as string)
        .maybeSingle();
      if (!order) throw new Error("Order not found");
      if (order.stripe_payment_intent) {
        try {
          const stripe = createStripeClient(data.environment);
          await stripe.refunds.create({ payment_intent: order.stripe_payment_intent as string });
        } catch (e) {
          throw new Error(getStripeErrorMessage(e));
        }
      }
      await admin.from("orders").update({ status: "refunded", payout_status: "hold" }).eq("id", order.id as string);
    }

    await admin
      .from("refund_requests")
      .update({
        status: data.approve ? "approved" : "rejected",
        admin_notes: data.notes ?? null,
        decided_by: userId,
        decided_at: new Date().toISOString(),
      })
      .eq("id", data.refundRequestId);

    return { ok: true };
  });
