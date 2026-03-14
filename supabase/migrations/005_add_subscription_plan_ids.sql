-- Add Razorpay subscription plan ID settings
INSERT INTO public.payment_settings (key, value) VALUES
  ('monthly_plan_id', ''),
  ('yearly_plan_id', '')
ON CONFLICT (key) DO NOTHING;

-- Add subscription ID column to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
