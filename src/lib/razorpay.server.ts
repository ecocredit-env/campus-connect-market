// Razorpay server-side helpers. Runs in the TanStack server runtime (Workers).
// Uses fetch + Web Crypto so it works without Node-only deps.

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

function getEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`${key} is not configured`);
  return v;
}

export function getRazorpayKeyId(): string {
  return getEnv("RAZORPAY_KEY_ID");
}

function authHeader(): string {
  const id = getEnv("RAZORPAY_KEY_ID");
  const secret = getEnv("RAZORPAY_KEY_SECRET");
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
};

export async function createRazorpayOrder(params: {
  amount: number; // in major units (rupees)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: Math.round(params.amount * 100), // paise
      currency: params.currency ?? "INR",
      receipt: params.receipt,
      notes: params.notes,
      payment_capture: 1,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order failed: ${res.status} ${text}`);
  }
  return (await res.json()) as RazorpayOrder;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Buffer.from(new Uint8Array(sig)).toString("hex");
}

export async function verifyCheckoutSignature(opts: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<boolean> {
  const expected = await hmacHex(getEnv("RAZORPAY_KEY_SECRET"), `${opts.orderId}|${opts.paymentId}`);
  return timingSafeEqualHex(expected, opts.signature);
}

export async function verifyWebhookSignature(body: string, signature: string | null): Promise<boolean> {
  if (!signature) return false;
  const expected = await hmacHex(getEnv("RAZORPAY_WEBHOOK_SECRET"), body);
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
