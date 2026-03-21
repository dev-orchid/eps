-- ============================================
-- Trial Extension Requests
-- ============================================
CREATE TABLE public.trial_extension_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.trial_extension_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests" ON public.trial_extension_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" ON public.trial_extension_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
    )
  );

-- Users can insert their own requests
CREATE POLICY "Users can insert own requests" ON public.trial_extension_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can update any request (approve/deny)
CREATE POLICY "Admins can update requests" ON public.trial_extension_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
    )
  );
