-- Enable the http extension for making external API calls
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- RPC function to create a Razorpay subscription
CREATE OR REPLACE FUNCTION public.create_razorpay_subscription(plan_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_key_id TEXT;
  v_key_secret TEXT;
  v_plan_id TEXT;
  v_profile RECORD;
  v_response extensions.http_response;
  v_body JSONB;
  v_auth TEXT;
  v_total_count INT;
BEGIN
  -- Get the calling user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  -- Validate plan type
  IF plan_type NOT IN ('monthly', 'yearly') THEN
    RETURN jsonb_build_object('error', 'Invalid plan type');
  END IF;

  -- Fetch Razorpay keys
  SELECT value INTO v_key_id FROM public.payment_settings WHERE key = 'razorpay_key_id';
  SELECT value INTO v_key_secret FROM public.payment_settings WHERE key = 'razorpay_key_secret';

  IF v_key_id IS NULL OR v_key_id = '' OR v_key_secret IS NULL OR v_key_secret = '' THEN
    RETURN jsonb_build_object('error', 'Razorpay keys not configured');
  END IF;

  -- Fetch the plan ID
  IF plan_type = 'monthly' THEN
    SELECT value INTO v_plan_id FROM public.payment_settings WHERE key = 'monthly_plan_id';
    v_total_count := 12;
  ELSE
    SELECT value INTO v_plan_id FROM public.payment_settings WHERE key = 'yearly_plan_id';
    v_total_count := 5;
  END IF;

  IF v_plan_id IS NULL OR v_plan_id = '' THEN
    RETURN jsonb_build_object('error', 'Subscription plan not configured');
  END IF;

  -- Fetch user profile
  SELECT email, full_name, phone INTO v_profile FROM public.profiles WHERE id = v_user_id;

  -- Build auth header (Base64 of key_id:key_secret)
  v_auth := 'Basic ' || encode((v_key_id || ':' || v_key_secret)::bytea, 'base64');

  -- Build request body
  v_body := jsonb_build_object(
    'plan_id', v_plan_id,
    'total_count', v_total_count,
    'quantity', 1,
    'customer_notify', 0,
    'notes', jsonb_build_object(
      'user_id', v_user_id::text,
      'email', COALESCE(v_profile.email, ''),
      'plan', plan_type
    )
  );

  -- Call Razorpay API
  SELECT * INTO v_response FROM extensions.http((
    'POST',
    'https://api.razorpay.com/v1/subscriptions',
    ARRAY[extensions.http_header('Authorization', v_auth)],
    'application/json',
    v_body::text
  )::extensions.http_request);

  -- Check response
  IF v_response.status != 200 AND v_response.status != 201 THEN
    RETURN jsonb_build_object('error', 'Failed to create subscription', 'details', v_response.content::jsonb);
  END IF;

  -- Return subscription ID
  RETURN jsonb_build_object(
    'subscription_id', (v_response.content::jsonb)->>'id',
    'plan', plan_type
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.create_razorpay_subscription(TEXT) TO authenticated;
