
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.listing_category AS ENUM ('cycles', 'coolers', 'electronics');
CREATE TYPE public.listing_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
CREATE TYPE public.listing_status AS ENUM ('active', 'sold', 'archived', 'pending_review');
CREATE TYPE public.interest_status AS ENUM ('pending', 'approved', 'rejected', 'blocked');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  registration_number TEXT,
  department TEXT,
  year_of_study TEXT,
  college_email TEXT,
  phone TEXT,
  bio TEXT,
  profile_photo TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'pending',
  id_document_path TEXT,
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_transactions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Listings
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category public.listing_category NOT NULL,
  subcategory TEXT,
  condition public.listing_condition NOT NULL,
  brand TEXT,
  model TEXT,
  manufacturing_year INT,
  original_price NUMERIC(10,2),
  price NUMERIC(10,2) NOT NULL,
  photos TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  delivery_option TEXT NOT NULL DEFAULT 'pickup',
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  status public.listing_status NOT NULL DEFAULT 'active',
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_seller ON public.listings(seller_id);

-- Interest requests
CREATE TABLE public.interest_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.interest_status NOT NULL DEFAULT 'pending',
  initial_message TEXT,
  response_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(listing_id, buyer_id)
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Roles policies
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Listings policies
CREATE POLICY "Active listings viewable by authenticated" ON public.listings
  FOR SELECT TO authenticated USING (status = 'active' OR seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Approved users create listings" ON public.listings
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND verification_status = 'approved')
  );
CREATE POLICY "Sellers update own listings" ON public.listings
  FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Sellers delete own listings" ON public.listings
  FOR DELETE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Admins manage listings" ON public.listings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Interest requests policies
CREATE POLICY "Parties view their interest requests" ON public.interest_requests
  FOR SELECT TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers create interest" ON public.interest_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers respond to interest" ON public.interest_requests
  FOR UPDATE TO authenticated USING (auth.uid() = seller_id);

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, college_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER listings_touch BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('id-documents', 'id-documents', false);

-- Storage policies: listing-photos (public read, owner write)
CREATE POLICY "Listing photos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-photos');
CREATE POLICY "Users upload own listing photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users delete own listing photos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies: id-documents (private, owner + admin)
CREATE POLICY "Users view own ID docs" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'id-documents' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')
    )
  );
CREATE POLICY "Users upload own ID docs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'id-documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users update own ID docs" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'id-documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );
