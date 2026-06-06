
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS estimated_delivery_date date,
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS seller_notes text;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_delivery_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_delivery_status_check
  CHECK (delivery_status IN ('processing','shipped','delivered','cancelled'));

CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_order_id_key
  ON public.orders (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_payment_id_key
  ON public.orders (razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.seller_update_order_delivery(
  _order_id uuid,
  _estimated_delivery_date date,
  _delivery_status text,
  _seller_notes text
) RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row public.orders;
BEGIN
  IF _delivery_status NOT IN ('processing','shipped','delivered','cancelled') THEN
    RAISE EXCEPTION 'Invalid delivery status';
  END IF;

  UPDATE public.orders
     SET estimated_delivery_date = _estimated_delivery_date,
         delivery_status = _delivery_status,
         seller_notes = _seller_notes,
         updated_at = now()
   WHERE id = _order_id
     AND seller_id = auth.uid()
  RETURNING * INTO row;

  IF row.id IS NULL THEN
    RAISE EXCEPTION 'Order not found or you are not the seller';
  END IF;

  RETURN row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seller_update_order_delivery(uuid,date,text,text) TO authenticated;
