-- Orders: one row per successful Stripe checkout for a listing
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  amount_paid numeric NOT NULL,            -- total buyer paid (INR)
  commission_amount numeric NOT NULL DEFAULT 0,  -- platform cut
  seller_payout_amount numeric NOT NULL,   -- amount due to seller
  currency text NOT NULL DEFAULT 'inr',
  stripe_session_id text UNIQUE,
  stripe_payment_intent text,
  status text NOT NULL DEFAULT 'paid',     -- paid | refunded | disputed
  payout_status text NOT NULL DEFAULT 'pending', -- pending | sent | hold
  payout_note text,
  buyer_contact_email text,
  buyer_contact_phone text,
  delivery_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_orders_listing ON public.orders(listing_id);

GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers view their sales" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER orders_touch_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Refund requests: buyer submits, admin decides
CREATE TABLE public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  admin_notes text,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_refund_requests_status ON public.refund_requests(status);
CREATE INDEX idx_refund_requests_order ON public.refund_requests(order_id);

GRANT SELECT, INSERT ON public.refund_requests TO authenticated;
GRANT ALL ON public.refund_requests TO service_role;

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers create refund requests" ON public.refund_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id AND EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()
  ));
CREATE POLICY "Buyers view own refund requests" ON public.refund_requests
  FOR SELECT TO authenticated USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers view refund requests on their orders" ON public.refund_requests
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.seller_id = auth.uid()
  ));
CREATE POLICY "Admins manage refund requests" ON public.refund_requests
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER refund_requests_touch_updated BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();