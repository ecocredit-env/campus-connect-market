const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

export function PaymentTestModeBanner() {
  // The publishable Razorpay key id is also returned by the server when starting
  // checkout, so this banner is purely informational. It only renders when an
  // explicit VITE_RAZORPAY_KEY_ID is exposed at build time.
  if (!keyId) return null;
  if (keyId.startsWith("rzp_test_")) {
    return (
      <div className="w-full bg-warning/15 border-b border-warning/30 px-4 py-2 text-center text-xs text-foreground">
        Razorpay test mode — use card <code className="font-mono">4111 1111 1111 1111</code>, any future date, any CVV.
      </div>
    );
  }
  return null;
}
