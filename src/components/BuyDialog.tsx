import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { startRazorpayCheckout, confirmRazorpayPayment } from "@/lib/razorpay.functions";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.src = RAZORPAY_SCRIPT;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function BuyDialog({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  price,
  deliveryNote,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listingId: string;
  listingTitle: string;
  price: number;
  deliveryNote: string | null;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [hostel, setHostel] = useState("");
  const [room, setRoom] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const start = useServerFn(startRazorpayCheckout);
  const confirm = useServerFn(confirmRazorpayPayment);
  const navigate = useNavigate();

  const proceed = async () => {
    if (fullName.trim().length < 2) return toast.error("Enter your full name");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return toast.error("Enter a valid email");
    if (hostel.trim().length < 2) return toast.error("Enter your hostel");
    if (room.trim().length < 1) return toast.error("Enter your room number");
    if (address.trim().length < 5) return toast.error("Enter delivery address / landmark");
    if (!/^[+\d][\d\s-]{6,}$/.test(phone.trim())) return toast.error("Enter a valid contact number");
    if (!agree) return toast.error("Please accept the buyer terms to continue");

    setBusy(true);
    try {
      const ready = await loadRazorpay();
      if (!ready) throw new Error("Could not load Razorpay. Check your network and try again.");

      const fullAddress = `${fullName.trim()} — Hostel ${hostel.trim()}, Room ${room.trim()}. ${address.trim()}`;
      const res = await start({
        data: {
          listingId,
          fullName: fullName.trim(),
          deliveryAddress: fullAddress,
          contactPhone: phone.trim(),
          email: email.trim(),
        },
      });
      if ("error" in res) throw new Error(res.error);

      const rzp = new window.Razorpay({
        key: res.keyId,
        amount: res.amount,
        currency: res.currency,
        name: "UltraOver",
        description: res.listingTitle,
        order_id: res.orderId,
        prefill: {
          name: res.buyerName,
          email: res.buyerEmail,
          contact: res.buyerPhone,
        },
        notes: { listing_id: listingId },
        theme: { color: "#4f46e5" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const c = await confirm({
              data: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });
            if ("error" in c) {
              toast.error(c.error);
              return;
            }
            toast.success("Payment received");
            onOpenChange(false);
            navigate({ to: "/checkout/return", search: { session_id: response.razorpay_payment_id } });
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not confirm payment");
          }
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });
      rzp.on("payment.failed", (resp: any) => {
        toast.error(resp?.error?.description ?? "Payment failed");
        setBusy(false);
      });
      rzp.open();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout");
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Delivery details</DialogTitle>
          <DialogDescription>
            {listingTitle} — ₹{price.toLocaleString("en-IN")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As on college ID" />
            </div>
            <div className="space-y-1.5">
              <Label>Email (for receipt)</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
            </div>
            <div className="space-y-1.5">
              <Label>Hostel</Label>
              <Input value={hostel} onChange={(e) => setHostel(e.target.value)} placeholder="e.g. Hall 5 / Block C" />
            </div>
            <div className="space-y-1.5">
              <Label>Room no.</Label>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 214" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Landmark / extra delivery instructions</Label>
              <Textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Near mess gate, hand over to security…" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Contact phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9xxxxxxxxx" />
            </div>
          </div>

          {deliveryNote && (
            <p className="text-xs text-muted-foreground">
              Seller's delivery note: <strong>{deliveryNote}</strong>
            </p>
          )}

          <label className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
            <span>
              I confirm the details above are correct and accept UltraOver's buyer terms: inspect the item on delivery, refunds only via manual admin review, and contact details will be shared with the seller for handover.
            </span>
          </label>

          <Button onClick={proceed} disabled={busy} className="w-full">
            {busy ? "Starting…" : `Pay ₹${price.toLocaleString("en-IN")} with Razorpay`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
