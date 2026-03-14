-- ============================================
-- Payment Settings & Payment History
-- ============================================

-- Admin-configurable payment settings (Razorpay keys, plan prices)
CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (frontend needs Razorpay key_id)
CREATE POLICY "Anyone can view payment_settings" ON public.payment_settings
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert payment_settings" ON public.payment_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Admin')
  );
CREATE POLICY "Admins can update payment_settings" ON public.payment_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Admin')
  );

-- Seed default settings
INSERT INTO public.payment_settings (key, value) VALUES
  ('razorpay_key_id', ''),
  ('razorpay_key_secret', ''),
  ('monthly_price', '15000'),
  ('yearly_price', '135000'),
  ('monthly_label', '₹150/month'),
  ('yearly_label', '₹1,350/year'),
  ('currency', 'INR');

-- Payment history
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can see their own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert own payments
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Admin')
  );
