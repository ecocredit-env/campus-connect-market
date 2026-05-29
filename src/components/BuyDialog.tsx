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
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fn = useServerFn(createListingCheckout);

  const proceed = async () => {
    if (address.trim().length < 5) return toast.error("Enter delivery details");
    if (phone.trim().length < 6) return toast.error("Enter a contact number");
    setBusy(true);
    try {
      const res = await fn({
        data: {
          listingId,
          deliveryAddress: address.trim(),
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
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Hostel / delivery address</Label>
              <Textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Hostel Block C, Room 214"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Contact phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9xxxxxxxxx" />
            </div>
            {deliveryNote && (
              <p className="text-xs text-muted-foreground">
                Seller's delivery note: {deliveryNote}
              </p>
            )}
            <Button onClick={proceed} disabled={busy} className="w-full">
              {busy ? "Starting…" : "Continue to payment"}
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
