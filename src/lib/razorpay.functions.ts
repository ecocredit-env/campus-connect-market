import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  verifyCheckoutSignature,
} from "@/lib/razorpay.server";

const COMMISSION_RATE = 0.037;

type StartResult =
  | {
      orderId: string;
      keyId: string;
      amount: number;
      currency: string;
      listingTitle: string;
      buyerName: string;
      buyerEmail: string;
      buyerPhone: string;
    }
  | { error: string };

export const startRazorpayCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    listingId: string;
    fullName: string;
    deliveryAddress: string;
    contactPhone: string;
    email: string;
  }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.listingId)) throw new Error("Invalid listing id");
    if (!data.fullName || data.fullName.length < 2) throw new Error("Name required");
    if (!data.deliveryAddress || data.deliveryAddress.length < 5) throw new Error("Delivery address required");
    if (!data.contactPhone || data.contactPhone.length < 6) throw new Error("Contact phone required");
    if (!/^\S+@\S+\.\S+$/.test(data.email)) throw new Error("Email required");
    return data;
  })
  .handler(async ({ data, context }): Promise<StartResult> => {
    try {
      const { supabase, userId } = context;
      const { data: listing, error } = await supabase
        .from("listings")
        .select("id, seller_id, title, price, status")
        .eq("id", data.listingId)
        .maybeSingle();
      if (error || !listing) return { error: "Listing not found" };
      if (listing.status !== "active") return { error: "Listing is no longer available" };
      if (listing.seller_id === userId) return { error: "You cannot buy your own listing" };

      const order = await createRazorpayOrder({
        amount: Number(listing.price),
        currency: "INR",
        receipt: `lst_${listing.id.slice(0, 20)}`,
        notes: {
          listing_id: listing.id,
          buyer_id: userId,
          seller_id: listing.seller_id as string,
          delivery_address: data.deliveryAddress.slice(0, 450),
          contact_phone: data.contactPhone.slice(0, 30),
          buyer_email: data.email.slice(0, 200),
        },
      });

      return {
        orderId: order.id,
        keyId: getRazorpayKeyId(),
        amount: order.amount,
        currency: order.currency,
        listingTitle: listing.title as string,
        buyerName: data.fullName,
        buyerEmail: data.email,
        buyerPhone: data.contactPhone,
      };
    } catch (e) {
      console.error("startRazorpayCheckout error", e);
      return { error: e instanceof Error ? e.message : "Could not start payment" };
    }
  });

type ConfirmResult = { ok: true; orderRowId: string } | { error: string };

// Backstop confirmation called from the client after Razorpay's success handler.
// The authoritative state still comes from the webhook; this just lets us
// reflect the success immediately even if the webhook is delayed.
export const confirmRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    if (!data.razorpayOrderId || !data.razorpayPaymentId || !data.razorpaySignature)
      throw new Error("Missing payment fields");
    return data;
  })
  .handler(async ({ data, context }): Promise<ConfirmResult> => {
    try {
      const ok = await verifyCheckoutSignature({
        orderId: data.razorpayOrderId,
        paymentId: data.razorpayPaymentId,
        signature: data.razorpaySignature,
      });
      if (!ok) return { error: "Signature verification failed" };

      const { userId } = context;
      const admin = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      // Pull order from Razorpay to get notes + amount authoritatively.
      const rzpRes = await fetch(`https://api.razorpay.com/v1/orders/${data.razorpayOrderId}`, {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64"),
        },
      });
      if (!rzpRes.ok) return { error: "Could not load order from Razorpay" };
      const rzpOrder = (await rzpRes.json()) as {
        id: string;
        amount: number;
        currency: string;
        notes: Record<string, string>;
      };
      const notes = rzpOrder.notes ?? {};
      if (notes.buyer_id !== userId) return { error: "Order does not belong to this user" };

      const amountPaid = (rzpOrder.amount ?? 0) / 100;
      const commission = Math.round(amountPaid * COMMISSION_RATE * 100) / 100;
      const payout = Math.round((amountPaid - commission) * 100) / 100;

      const { data: upserted, error: upErr } = await (admin.from("orders") as any).upsert(
        {
          listing_id: notes.listing_id,
          buyer_id: notes.buyer_id,
          seller_id: notes.seller_id,
          amount_paid: amountPaid,
          commission_amount: commission,
          seller_payout_amount: payout,
          currency: (rzpOrder.currency ?? "INR").toLowerCase(),
          razorpay_order_id: rzpOrder.id,
          razorpay_payment_id: data.razorpayPaymentId,
          status: "paid",
          payout_status: "pending",
          buyer_contact_phone: notes.contact_phone ?? null,
          delivery_address: notes.delivery_address ?? null,
          buyer_contact_email: notes.buyer_email ?? null,
        },
        { onConflict: "razorpay_order_id" },
      ).select("id").maybeSingle();
      if (upErr) return { error: upErr.message };

      await (admin.from("listings") as any).update({ status: "sold" }).eq("id", notes.listing_id);

      return { ok: true, orderRowId: (upserted?.id as string) ?? "" };
    } catch (e) {
      console.error("confirmRazorpayPayment error", e);
      return { error: e instanceof Error ? e.message : "Could not confirm payment" };
    }
  });
