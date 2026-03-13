-- ============================================
-- Migration: Make current_affairs shared across all users
-- User-specific status (read, study) moves to user_affair_status
-- ============================================

-- 1. Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view own current_affairs" ON public.current_affairs;
DROP POLICY IF EXISTS "Users can insert own current_affairs" ON public.current_affairs;
DROP POLICY IF EXISTS "Users can update own current_affairs" ON public.current_affairs;
DROP POLICY IF EXISTS "Users can delete own current_affairs" ON public.current_affairs;

-- 2. Remove user-specific columns from current_affairs
ALTER TABLE public.current_affairs DROP COLUMN IF EXISTS is_read;
ALTER TABLE public.current_affairs DROP COLUMN IF EXISTS added_to_study;

-- 3. Make user_id nullable (articles can be system-generated)
ALTER TABLE public.current_affairs ALTER COLUMN user_id DROP NOT NULL;

-- 4. New RLS policies: all authenticated users can read all articles
--    Any authenticated user can insert. Only creator can delete.
CREATE POLICY "All authenticated users can view current_affairs"
  ON public.current_affairs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert current_affairs"
  ON public.current_affairs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creator can delete current_affairs"
  ON public.current_affairs FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Create user_affair_status table for per-user tracking
CREATE TABLE public.user_affair_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  affair_id UUID REFERENCES public.current_affairs(id) ON DELETE CASCADE NOT NULL,
  is_read BOOLEAN DEFAULT false,
  added_to_study BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, affair_id)
);

ALTER TABLE public.user_affair_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affair status"
  ON public.user_affair_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affair status"
  ON public.user_affair_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affair status"
  ON public.user_affair_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own affair status"
  ON public.user_affair_status FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_user_affair_status_user_id
  BEFORE INSERT ON public.user_affair_status
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- 6. Index for fast lookups
CREATE INDEX idx_user_affair_status_user_affair
  ON public.user_affair_status(user_id, affair_id);

CREATE INDEX idx_current_affairs_date
  ON public.current_affairs(date DESC);
