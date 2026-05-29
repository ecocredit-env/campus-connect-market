const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full bg-destructive/10 border-b border-destructive/30 px-4 py-2 text-center text-sm text-destructive">
        Production checkout is not configured. Complete Stripe go-live to accept real payments.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full bg-warning/15 border-b border-warning/30 px-4 py-2 text-center text-xs text-foreground">
        Test mode — use card <code className="font-mono">4242 4242 4242 4242</code>, any future date, any CVC.
      </div>
    );
  }
  return null;
}
