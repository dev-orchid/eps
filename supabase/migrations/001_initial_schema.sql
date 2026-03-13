-- ============================================
-- Exam Prep Manager — Initial Schema
-- ============================================

-- Helper function to auto-set user_id on insert
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- EXAMS TABLE
-- ============================================
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  exam_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exams" ON public.exams
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exams" ON public.exams
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exams" ON public.exams
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exams" ON public.exams
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_exams_user_id
  BEFORE INSERT ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_tasks_user_id
  BEFORE INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ============================================
-- STUDY SESSIONS TABLE
-- ============================================
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study_sessions" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study_sessions" ON public.study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study_sessions" ON public.study_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study_sessions" ON public.study_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_study_sessions_user_id
  BEFORE INSERT ON public.study_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ============================================
-- ALARMS TABLE
-- ============================================
CREATE TABLE public.alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  alarm_time TIME NOT NULL,
  days TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alarms" ON public.alarms
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alarms" ON public.alarms
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alarms" ON public.alarms
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alarms" ON public.alarms
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_alarms_user_id
  BEFORE INSERT ON public.alarms
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ============================================
-- CURRENT AFFAIRS TABLE
-- ============================================
CREATE TABLE public.current_affairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  summary TEXT,
  source_url TEXT,
  date DATE DEFAULT CURRENT_DATE,
  is_read BOOLEAN DEFAULT false,
  added_to_study BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.current_affairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own current_affairs" ON public.current_affairs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own current_affairs" ON public.current_affairs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own current_affairs" ON public.current_affairs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own current_affairs" ON public.current_affairs
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_current_affairs_user_id
  BEFORE INSERT ON public.current_affairs
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
