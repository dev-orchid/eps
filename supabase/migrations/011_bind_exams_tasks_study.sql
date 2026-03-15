-- ============================================
-- Bind Tasks & Study Sessions to Exams
-- ============================================

-- Add exam_id to tasks
ALTER TABLE public.tasks ADD COLUMN exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL;
CREATE INDEX idx_tasks_exam_id ON public.tasks(exam_id);

-- Add exam_id to study_sessions
ALTER TABLE public.study_sessions ADD COLUMN exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL;
CREATE INDEX idx_study_sessions_exam_id ON public.study_sessions(exam_id);
