-- ============================================
-- Syllabus Tracker System
-- Pre-loaded UPSC & State PSC syllabus topics
-- ============================================

-- Syllabus templates (shared, not per-user)
CREATE TABLE public.syllabus_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type TEXT NOT NULL CHECK (exam_type IN ('UPSC CSE', 'BPSC', 'UPPSC', 'MPSC', 'Custom')),
  paper TEXT NOT NULL,
  topic TEXT NOT NULL,
  subtopic TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.syllabus_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can view templates" ON public.syllabus_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage templates" ON public.syllabus_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Admin')
);

-- User's personal syllabus progress
CREATE TABLE public.syllabus_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.syllabus_templates(id) ON DELETE CASCADE,
  -- For custom topics (no template_id)
  custom_topic TEXT,
  custom_paper TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'revised', 'done')),
  notes TEXT DEFAULT '',
  revision_count INTEGER DEFAULT 0,
  last_studied TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, template_id)
);

CREATE INDEX idx_syllabus_progress_user ON public.syllabus_progress(user_id);
CREATE INDEX idx_syllabus_progress_status ON public.syllabus_progress(status);

ALTER TABLE public.syllabus_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.syllabus_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.syllabus_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.syllabus_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON public.syllabus_progress FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.syllabus_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Admin')
);

-- ============================================
-- Seed UPSC CSE Syllabus (Prelims + Mains)
-- ============================================

INSERT INTO public.syllabus_templates (exam_type, paper, topic, subtopic, sort_order) VALUES
-- GS Paper I (Mains)
('UPSC CSE', 'GS-I', 'Indian Heritage & Culture', 'Art Forms, Literature, Architecture', 1),
('UPSC CSE', 'GS-I', 'Indian Heritage & Culture', 'Salient aspects of Indian culture from ancient to modern', 2),
('UPSC CSE', 'GS-I', 'Modern Indian History', 'Events from mid-18th century to present', 3),
('UPSC CSE', 'GS-I', 'Modern Indian History', 'Significant personalities & their contributions', 4),
('UPSC CSE', 'GS-I', 'Freedom Struggle', 'Stages and important contributions from different parts of India', 5),
('UPSC CSE', 'GS-I', 'Post-Independence India', 'Consolidation, reorganization within the country', 6),
('UPSC CSE', 'GS-I', 'World History', '18th century events — Industrial Revolution, World Wars, Colonization', 7),
('UPSC CSE', 'GS-I', 'Indian Society', 'Salient features, diversity, role of women, population issues', 8),
('UPSC CSE', 'GS-I', 'Indian Society', 'Effects of globalization on Indian society', 9),
('UPSC CSE', 'GS-I', 'Social Empowerment', 'Communalism, Regionalism, Secularism', 10),
('UPSC CSE', 'GS-I', 'Physical Geography', 'Geomorphology, Climatology, Oceanography', 11),
('UPSC CSE', 'GS-I', 'Physical Geography', 'Distribution of key natural resources across the world', 12),
('UPSC CSE', 'GS-I', 'Human Geography', 'Factors responsible for distribution of industries', 13),

-- GS Paper II (Mains)
('UPSC CSE', 'GS-II', 'Indian Constitution', 'Historical underpinnings, evolution, features, amendments', 14),
('UPSC CSE', 'GS-II', 'Indian Constitution', 'Functions and responsibilities of Union & States', 15),
('UPSC CSE', 'GS-II', 'Indian Constitution', 'Separation of powers, dispute redressal mechanisms', 16),
('UPSC CSE', 'GS-II', 'Indian Constitution', 'Federal structure, Parliament & State Legislatures', 17),
('UPSC CSE', 'GS-II', 'Governance', 'Government policies & interventions in various sectors', 18),
('UPSC CSE', 'GS-II', 'Governance', 'Issues relating to development and management of welfare schemes', 19),
('UPSC CSE', 'GS-II', 'Governance', 'Role of civil services in a democracy', 20),
('UPSC CSE', 'GS-II', 'Social Justice', 'Mechanisms, laws, institutions for vulnerable sections', 21),
('UPSC CSE', 'GS-II', 'Social Justice', 'Issues relating to education and health', 22),
('UPSC CSE', 'GS-II', 'International Relations', 'India & its neighborhood relations', 23),
('UPSC CSE', 'GS-II', 'International Relations', 'Bilateral, regional and global groupings involving India', 24),
('UPSC CSE', 'GS-II', 'International Relations', 'Important International Institutions & agencies', 25),

-- GS Paper III (Mains)
('UPSC CSE', 'GS-III', 'Indian Economy', 'Planning, mobilization of resources, growth & development', 26),
('UPSC CSE', 'GS-III', 'Indian Economy', 'Inclusive growth, budgeting, fiscal policy', 27),
('UPSC CSE', 'GS-III', 'Indian Economy', 'Issues related to employment, land reforms', 28),
('UPSC CSE', 'GS-III', 'Agriculture', 'Major crops, irrigation, agricultural marketing', 29),
('UPSC CSE', 'GS-III', 'Agriculture', 'Food processing, e-technology for farmers', 30),
('UPSC CSE', 'GS-III', 'Science & Technology', 'Developments & applications in everyday life', 31),
('UPSC CSE', 'GS-III', 'Science & Technology', 'Awareness in IT, Space, Computers, Robotics, Biotech', 32),
('UPSC CSE', 'GS-III', 'Science & Technology', 'Indigenization of technology, new technologies', 33),
('UPSC CSE', 'GS-III', 'Environment & Ecology', 'Conservation, environmental pollution & degradation', 34),
('UPSC CSE', 'GS-III', 'Environment & Ecology', 'Biodiversity, environmental impact assessment', 35),
('UPSC CSE', 'GS-III', 'Disaster Management', 'Disaster types, prevention & mitigation strategies', 36),
('UPSC CSE', 'GS-III', 'Internal Security', 'Linkages between development & extremism', 37),
('UPSC CSE', 'GS-III', 'Internal Security', 'Border management, cyber security, money laundering', 38),
('UPSC CSE', 'GS-III', 'Internal Security', 'Role of media and social networking sites in internal security', 39),

-- GS Paper IV (Ethics)
('UPSC CSE', 'GS-IV', 'Ethics & Human Interface', 'Essence, determinants & consequences of Ethics in human actions', 40),
('UPSC CSE', 'GS-IV', 'Ethics & Human Interface', 'Dimensions of ethics, private & public relationships', 41),
('UPSC CSE', 'GS-IV', 'Attitude', 'Content, structure, function; influence & relation with thought and behaviour', 42),
('UPSC CSE', 'GS-IV', 'Aptitude & Values', 'Integrity, impartiality, non-partisanship, tolerance, compassion', 43),
('UPSC CSE', 'GS-IV', 'Emotional Intelligence', 'Concepts and their application in administration and governance', 44),
('UPSC CSE', 'GS-IV', 'Thinkers & Philosophers', 'Contributions of moral thinkers from India and world', 45),
('UPSC CSE', 'GS-IV', 'Public Administration Ethics', 'Ethical issues in government and private institutions', 46),
('UPSC CSE', 'GS-IV', 'Probity in Governance', 'Public service values, Code of Conduct, Code of Ethics, RTI, work culture', 47),
('UPSC CSE', 'GS-IV', 'Case Studies', 'Case Studies on ethical dilemmas (practical application)', 48),

-- Prelims (GS Paper I)
('UPSC CSE', 'Prelims', 'Current Events', 'National & International importance', 49),
('UPSC CSE', 'Prelims', 'Indian History', 'Indian National Movement', 50),
('UPSC CSE', 'Prelims', 'Indian & World Geography', 'Physical, Social, Economic Geography of India and the World', 51),
('UPSC CSE', 'Prelims', 'Indian Polity & Governance', 'Constitution, Political System, Panchayati Raj, Public Policy, Rights', 52),
('UPSC CSE', 'Prelims', 'Economic & Social Development', 'Sustainable Development, Poverty, Inclusion, Demographics', 53),
('UPSC CSE', 'Prelims', 'Environment & Ecology', 'General issues, Biodiversity, Climate Change — no subject specialization', 54),
('UPSC CSE', 'Prelims', 'General Science', 'Physics, Chemistry, Biology basics', 55),

-- CSAT (Prelims Paper II)
('UPSC CSE', 'CSAT', 'Comprehension', 'Reading comprehension & interpersonal skills', 56),
('UPSC CSE', 'CSAT', 'Logical Reasoning', 'Analytical ability & logical reasoning', 57),
('UPSC CSE', 'CSAT', 'Quantitative Aptitude', 'Basic numeracy, data interpretation', 58),
('UPSC CSE', 'CSAT', 'Decision Making', 'Decision making and problem solving', 59),
('UPSC CSE', 'CSAT', 'English Comprehension', 'General mental ability (Class X level)', 60),

-- Essay
('UPSC CSE', 'Essay', 'Essay Writing', 'Two essays from a choice of topics (Section A & B)', 61),

-- Optional (placeholder — users pick their own)
('UPSC CSE', 'Optional', 'Optional Subject', 'Paper I — chosen by aspirant', 62),
('UPSC CSE', 'Optional', 'Optional Subject', 'Paper II — chosen by aspirant', 63);
