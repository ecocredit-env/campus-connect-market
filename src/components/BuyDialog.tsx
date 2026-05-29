import { useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { useServerFn } from "@tanstack/react-start";
import { createListingCheckout } from "@/utils/payments.functions";
import { toast } from "sonner";

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
  const [step, setStep] = useState<"details" | "pay">("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [hostel, setHostel] = useState("");
  const [room, setRoom] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fn = useServerFn(createListingCheckout);

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
      const fullAddress = `${fullName.trim()} — Hostel ${hostel.trim()}, Room ${room.trim()}. ${address.trim()} (email: ${email.trim()})`;
      const res = await fn({
        data: {
          listingId,
          deliveryAddress: fullAddress,
          contactPhone: phone.trim(),
          returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in res) throw new Error(res.error);
      setClientSecret(res.clientSecret);
      setStep("pay");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setStep("details");
    setClientSecret(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : reset())}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step === "details" ? "Delivery details" : "Pay securely"}</DialogTitle>
          <DialogDescription>
            {listingTitle} — ₹{price.toLocaleString("en-IN")}
          </DialogDescription>
        </DialogHeader>

        {step === "details" && (
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
              {busy ? "Starting…" : "Continue to secure payment"}
            </Button>
          </div>
        )}

        {step === "pay" && clientSecret && (
          <div id="checkout" className="rounded-md overflow-hidden">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
