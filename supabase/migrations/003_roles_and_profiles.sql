-- ============================================
-- Roles & User Profiles for Admin Management
-- ============================================

-- ============================================
-- PROFILES TABLE (must be created first — referenced by roles RLS)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'User',
  plan TEXT NOT NULL DEFAULT 'Trial' CHECK (plan IN ('Trial', 'Premium')),
  trial_end DATE DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (needed for admin user list)
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'Admin'
    )
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'Admin'
    )
  );

-- Allow insert for new signups
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, plan, trial_end)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'User',
    'Trial',
    CURRENT_DATE + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'Custom' CHECK (type IN ('System', 'Custom')),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Everyone can read roles
CREATE POLICY "Anyone can view roles" ON public.roles
  FOR SELECT USING (true);

-- Only admins can modify roles
CREATE POLICY "Admins can insert roles" ON public.roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
    )
  );
CREATE POLICY "Admins can update roles" ON public.roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
    )
  );
CREATE POLICY "Admins can delete custom roles" ON public.roles
  FOR DELETE USING (
    type = 'Custom' AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
    )
  );

-- Seed default system roles
INSERT INTO public.roles (name, description, type, permissions) VALUES
  ('Admin', 'Full system administrator with access to all features', 'System',
    ARRAY['dashboard','exams','tasks','study','progress','alarms','current_affairs','profile','user_management','role_management']),
  ('Moderator', 'Can manage users and content but cannot change roles or settings', 'System',
    ARRAY['dashboard','exams','tasks','study','progress','alarms','current_affairs','profile','user_management']),
  ('User', 'Standard user with access to study tools and own data', 'System',
    ARRAY['dashboard','exams','tasks','study','progress','alarms','current_affairs','profile']);
