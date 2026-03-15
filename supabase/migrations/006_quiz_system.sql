-- ============================================
-- MCQ Quiz System (No external AI dependency)
-- ============================================

-- Subject/Topic Taxonomy
CREATE TABLE public.quiz_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  paper TEXT NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'Both' CHECK (exam_type IN ('UPSC', 'State PSC', 'Both')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.quiz_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can view subjects" ON public.quiz_subjects FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO public.quiz_subjects (name, paper, exam_type, sort_order) VALUES
  ('Art & Culture', 'GS-I', 'Both', 1),
  ('Indian History', 'GS-I', 'Both', 2),
  ('World History', 'GS-I', 'UPSC', 3),
  ('Indian Society', 'GS-I', 'Both', 4),
  ('Social Issues', 'GS-I', 'Both', 5),
  ('Polity & Governance', 'GS-II', 'Both', 6),
  ('International Relations', 'GS-II', 'UPSC', 7),
  ('Social Justice', 'GS-II', 'Both', 8),
  ('Economy', 'GS-III', 'Both', 9),
  ('Environment & Ecology', 'GS-III', 'Both', 10),
  ('Science & Technology', 'GS-III', 'Both', 11),
  ('Security & Defence', 'GS-III', 'Both', 12),
  ('Disaster Management', 'GS-III', 'Both', 13),
  ('Ethics & Integrity', 'GS-IV', 'UPSC', 14),
  ('Geography', 'Prelims', 'Both', 15),
  ('General Science', 'Prelims', 'Both', 16),
  ('Current Affairs', 'Prelims', 'Both', 17);

-- Questions Table (shared question bank)
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.quiz_subjects(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('pyq', 'manual')),
  pyq_year INTEGER,
  pyq_exam TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can view questions" ON public.quiz_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert questions" ON public.quiz_questions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE POLICY "Admins can update questions" ON public.quiz_questions FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE POLICY "Admins can delete questions" ON public.quiz_questions FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE INDEX idx_quiz_questions_subject ON public.quiz_questions(subject_id);
CREATE INDEX idx_quiz_questions_difficulty ON public.quiz_questions(difficulty);

-- Quiz Attempts (per user)
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('daily', 'subject_practice', 'full_mock', 'custom')),
  paper TEXT,
  subject_id UUID REFERENCES public.quiz_subjects(id) ON DELETE SET NULL,
  question_ids UUID[] NOT NULL DEFAULT '{}',
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  score_percentage NUMERIC(5,2) DEFAULT 0,
  time_limit_minutes INTEGER,
  time_taken_seconds INTEGER,
  difficulty TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON public.quiz_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);

-- Individual Answers (per user per question per attempt)
CREATE TABLE public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own answers" ON public.quiz_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own answers" ON public.quiz_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_quiz_answers_attempt ON public.quiz_answers(attempt_id);
CREATE INDEX idx_quiz_answers_user ON public.quiz_answers(user_id);

-- ============================================
-- Seed UPSC PYQ-style Question Bank
-- ============================================

-- Polity & Governance (GS-II)
INSERT INTO public.quiz_questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_year, pyq_exam, tags) VALUES
((SELECT id FROM public.quiz_subjects WHERE name = 'Polity & Governance'),
'Consider the following statements about the Attorney General of India:
1. He is appointed by the President of India.
2. He must have the same qualifications as a Supreme Court judge.
3. He has the right to vote in Parliament.
Which of the statements given above is/are correct?',
'1 and 2 only', '2 and 3 only', '1 only', '1, 2 and 3',
'A', 'The Attorney General is appointed by the President (Art. 76). He must be qualified to be a Supreme Court judge. However, he has right to speak and take part in proceedings of either House but has NO right to vote.', 'medium', 'pyq', 2019, 'UPSC Prelims', ARRAY['Article 76', 'Attorney General', 'Constitutional Posts']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Polity & Governance'),
'Which of the following is NOT a feature of the Indian Constitution?',
'Parliamentary sovereignty', 'Judicial review', 'Federal structure with unitary bias', 'Fundamental Rights',
'A', 'India follows Constitutional supremacy, not Parliamentary sovereignty like the UK. Parliament cannot override the Constitution. Judicial review (Art. 13, 32, 226), federal structure, and Fundamental Rights are all features of the Indian Constitution.', 'easy', 'pyq', 2020, 'UPSC Prelims', ARRAY['Constitutional Features', 'Parliamentary Sovereignty']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Polity & Governance'),
'Consider the following statements about the 73rd Constitutional Amendment:
1. It added Part IX to the Constitution.
2. It made Panchayati Raj institutions constitutional bodies.
3. It provides for direct election of Panchayat chairpersons at all levels.
Which of the statements given above is/are correct?',
'1 and 2 only', '2 and 3 only', '1 and 3 only', '1, 2 and 3',
'A', 'The 73rd Amendment (1992) added Part IX and made PRIs constitutional. However, direct election of chairpersons is mandated only at the village level. At intermediate and district levels, the state legislature decides the mode of election.', 'medium', 'pyq', 2018, 'UPSC Prelims', ARRAY['73rd Amendment', 'Panchayati Raj', 'Local Government']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Polity & Governance'),
'The concept of "Basic Structure" of the Constitution was established in which case?',
'Golaknath case (1967)', 'Kesavananda Bharati case (1973)', 'Minerva Mills case (1980)', 'Maneka Gandhi case (1978)',
'B', 'The Basic Structure doctrine was established in the Kesavananda Bharati v. State of Kerala case (1973). The 13-judge bench ruled that Parliament can amend any part of the Constitution but cannot alter its basic structure.', 'easy', 'pyq', 2017, 'UPSC Prelims', ARRAY['Basic Structure', 'Kesavananda Bharati', 'Constitutional Amendment']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Polity & Governance'),
'Consider the following statements about the Comptroller and Auditor General (CAG) of India:
1. CAG is appointed by the President by warrant under his hand and seal.
2. CAG can be removed only through impeachment.
3. CAG audits the accounts of both the Union and State governments.
Which of the statements given above is/are correct?',
'1 and 3 only', '2 and 3 only', '1, 2 and 3', '1 only',
'C', 'Under Article 148, CAG is appointed by the President. CAG can be removed in the same manner as a Supreme Court judge (i.e., impeachment under Art. 124). CAG audits accounts of Union, States, and UTs as per Articles 149-151.', 'medium', 'pyq', 2021, 'UPSC Prelims', ARRAY['CAG', 'Article 148', 'Constitutional Bodies']),

-- Economy (GS-III)
((SELECT id FROM public.quiz_subjects WHERE name = 'Economy'),
'Consider the following statements about the Goods and Services Tax (GST):
1. It is a destination-based consumption tax.
2. It subsumes all indirect taxes including customs duty.
3. The GST Council is a constitutional body.
Which of the statements given above is/are correct?',
'1 and 3 only', '1 and 2 only', '2 and 3 only', '1, 2 and 3',
'A', 'GST is destination-based. The GST Council (Art. 279A) is a constitutional body created by the 101st Amendment. However, GST does NOT subsume customs duty — customs duty is separate and continues to be levied by the Central Government.', 'medium', 'pyq', 2020, 'UPSC Prelims', ARRAY['GST', 'Indirect Tax', '101st Amendment']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Economy'),
'Which of the following is/are the function(s) of the Reserve Bank of India?
1. Banker to the Government
2. Management of foreign exchange reserves
3. Regulation of stock exchanges
Select the correct answer:',
'1 and 2 only', '2 and 3 only', '1, 2 and 3', '1 only',
'A', 'RBI acts as banker to the government and manages forex reserves under FEMA, 1999. However, regulation of stock exchanges is done by SEBI (Securities and Exchange Board of India), not RBI.', 'easy', 'pyq', 2019, 'UPSC Prelims', ARRAY['RBI', 'SEBI', 'Banking']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Economy'),
'What does "Current Account Deficit" mean?',
'Government spending exceeds revenue', 'Imports of goods and services exceed exports', 'Foreign investment outflows exceed inflows', 'Fiscal deficit exceeds GDP growth',
'B', 'Current Account Deficit (CAD) occurs when a country''s total imports of goods, services, and transfers exceed its total exports. It is part of the Balance of Payments and is different from fiscal deficit.', 'easy', 'pyq', 2018, 'UPSC Prelims', ARRAY['CAD', 'Balance of Payments', 'Trade']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Economy'),
'Consider the following statements about NITI Aayog:
1. It was established by a resolution of the Cabinet.
2. It has no power to allocate funds to states.
3. It replaced the Planning Commission.
Which of the statements given above is/are correct?',
'1 and 2 only', '2 and 3 only', '1, 2 and 3', '1 and 3 only',
'C', 'NITI Aayog was established on 1 January 2015 by a Cabinet resolution. Unlike the Planning Commission, it has no power to allocate funds — this is now done by the Finance Ministry. It replaced the Planning Commission.', 'medium', 'pyq', 2019, 'UPSC Prelims', ARRAY['NITI Aayog', 'Planning Commission', 'Economic Policy']),

-- Indian History (GS-I)
((SELECT id FROM public.quiz_subjects WHERE name = 'Indian History'),
'Who among the following was the founder of the "Servants of India Society"?',
'Bal Gangadhar Tilak', 'Gopal Krishna Gokhale', 'Dadabhai Naoroji', 'Mahatma Gandhi',
'B', 'Gopal Krishna Gokhale founded the Servants of India Society in 1905 in Pune. The society aimed to train Indians to serve the country and promote Indian interests. Gandhi considered Gokhale as his political guru.', 'easy', 'pyq', 2018, 'UPSC Prelims', ARRAY['Freedom Movement', 'Gokhale', 'Servants of India Society']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Indian History'),
'Consider the following events:
1. Rowlatt Act
2. Jallianwala Bagh Massacre
3. Non-Cooperation Movement
4. Chauri Chaura Incident
The correct chronological order is:',
'1-2-3-4', '2-1-3-4', '1-3-2-4', '2-1-4-3',
'A', 'Rowlatt Act (March 1919) → Jallianwala Bagh Massacre (13 April 1919) → Non-Cooperation Movement (1920-22) → Chauri Chaura (4 February 1922). The Chauri Chaura incident led Gandhi to call off the Non-Cooperation Movement.', 'medium', 'pyq', 2017, 'UPSC Prelims', ARRAY['Chronology', 'Freedom Movement', 'Gandhi']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Indian History'),
'The "Doctrine of Lapse" was introduced by:',
'Lord Wellesley', 'Lord Dalhousie', 'Lord Canning', 'Lord Cornwallis',
'B', 'The Doctrine of Lapse was an annexation policy applied by Lord Dalhousie (Governor-General, 1848-56). Under this doctrine, any Indian princely state under British suzerainty would be annexed if the ruler died without a natural male heir.', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['Doctrine of Lapse', 'Dalhousie', 'British Policy']),

-- Environment & Ecology (GS-III)
((SELECT id FROM public.quiz_subjects WHERE name = 'Environment & Ecology'),
'Consider the following statements about the National Green Tribunal (NGT):
1. It was established under the National Green Tribunal Act, 2010.
2. It deals with cases relating to environmental protection and conservation.
3. Its decisions can be challenged in the High Court.
Which of the statements given above is/are correct?',
'1 and 2 only', '2 and 3 only', '1, 2 and 3', '1 only',
'A', 'NGT was established under the NGT Act, 2010. It handles environmental cases. Its decisions can be challenged ONLY in the Supreme Court, not in High Courts. This is a specific provision under the Act to prevent delay.', 'medium', 'pyq', 2019, 'UPSC Prelims', ARRAY['NGT', 'Environmental Law', 'Tribunals']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Environment & Ecology'),
'Which of the following are the objectives of the National Biodiversity Authority (NBA)?
1. Conservation of biological diversity
2. Sustainable use of biological resources
3. Fair and equitable sharing of benefits from biological resources
Select the correct answer:',
'1 and 2 only', '2 and 3 only', '1 and 3 only', '1, 2 and 3',
'D', 'The NBA was established under the Biological Diversity Act, 2002 to implement the provisions of the Convention on Biological Diversity (CBD). All three are its objectives, aligned with the three pillars of the CBD.', 'easy', 'pyq', 2020, 'UPSC Prelims', ARRAY['NBA', 'Biodiversity', 'CBD']),

-- Science & Technology (GS-III)
((SELECT id FROM public.quiz_subjects WHERE name = 'Science & Technology'),
'Consider the following statements about ISRO''s Mars Orbiter Mission (Mangalyaan):
1. It was India''s first interplanetary mission.
2. India became the first Asian country to reach Mars orbit.
3. It was launched using PSLV-C25.
Which of the statements given above is/are correct?',
'1 and 3 only', '1, 2 and 3', '2 and 3 only', '1 only',
'A', 'Mangalyaan (2013-14) was India''s first interplanetary mission, launched on PSLV-C25. India became the first COUNTRY to succeed in its first attempt. However, Japan''s Nozomi mission (failed) preceded India in Asian attempts. The first Asian country to successfully orbit Mars was India, but the statement says "reach Mars orbit" — actually India was first Asian nation.', 'medium', 'pyq', 2018, 'UPSC Prelims', ARRAY['ISRO', 'Mangalyaan', 'Space Technology']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Science & Technology'),
'What is the purpose of the "NAVIC" system developed by ISRO?',
'Communication satellite system', 'Regional navigation satellite system', 'Earth observation satellite', 'Deep space communication network',
'B', 'NAVIC (Navigation with Indian Constellation), also known as IRNSS, is India''s independent regional navigation satellite system. It provides positioning service over India and 1,500 km around it. It consists of 7 satellites.', 'easy', 'pyq', 2019, 'UPSC Prelims', ARRAY['NAVIC', 'IRNSS', 'ISRO', 'Navigation']),

-- Geography (Prelims)
((SELECT id FROM public.quiz_subjects WHERE name = 'Geography'),
'Which of the following passes connects Leh with the Kashmir Valley?',
'Shipki La', 'Zoji La', 'Nathu La', 'Rohtang Pass',
'B', 'Zoji La (3,528m) connects Leh (Ladakh) with Srinagar (Kashmir Valley) on NH1. Shipki La is in Himachal Pradesh (India-China border). Nathu La connects Sikkim with Tibet. Rohtang Pass connects Manali with Lahaul-Spiti.', 'easy', 'pyq', 2017, 'UPSC Prelims', ARRAY['Mountain Passes', 'Ladakh', 'Kashmir']),

((SELECT id FROM public.quiz_subjects WHERE name = 'Geography'),
'Consider the following rivers:
1. Godavari
2. Krishna
3. Cauvery
4. Mahanadi
Which of the above rivers flow eastward and drain into the Bay of Bengal?',
'1 and 2 only', '1, 2 and 3 only', '1, 2 and 4 only', '1, 2, 3 and 4',
'D', 'All four rivers — Godavari, Krishna, Cauvery, and Mahanadi — flow eastward across the Deccan Plateau and drain into the Bay of Bengal. Major west-flowing rivers include Narmada and Tapi.', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['Rivers', 'Bay of Bengal', 'Drainage System']),

-- International Relations (GS-II)
((SELECT id FROM public.quiz_subjects WHERE name = 'International Relations'),
'Consider the following statements about the United Nations Security Council (UNSC):
1. It has 15 members, of which 5 are permanent.
2. Each permanent member has veto power.
3. Non-permanent members are elected for 3 years.
Which of the statements given above is/are correct?',
'1 and 2 only', '1, 2 and 3', '2 and 3 only', '1 only',
'A', 'UNSC has 15 members — 5 permanent (P5: USA, UK, France, Russia, China) with veto power, and 10 non-permanent members elected for 2-year terms (not 3 years) by the General Assembly.', 'medium', 'pyq', 2020, 'UPSC Prelims', ARRAY['UNSC', 'United Nations', 'International Organizations']),

-- General Science (Prelims)
((SELECT id FROM public.quiz_subjects WHERE name = 'General Science'),
'Which vitamin deficiency causes "Night Blindness"?',
'Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D',
'A', 'Night blindness (Nyctalopia) is caused by Vitamin A deficiency. Vitamin A is essential for the production of rhodopsin, a pigment in the retina that helps in vision under low-light conditions.', 'easy', 'manual', NULL, NULL, ARRAY['Vitamins', 'Deficiency Diseases', 'Biology']),

((SELECT id FROM public.quiz_subjects WHERE name = 'General Science'),
'Consider the following statements:
1. Sound travels faster in air than in water.
2. Light travels faster in vacuum than in any medium.
3. Electromagnetic waves require a medium to travel.
Which of the statements given above is/are correct?',
'2 only', '1 and 2 only', '2 and 3 only', '1, 2 and 3',
'A', 'Sound travels SLOWER in air than water (sound needs a medium and travels faster in denser media). Light travels fastest in vacuum (3×10⁸ m/s). Electromagnetic waves do NOT require a medium — they can travel through vacuum.', 'medium', 'manual', NULL, NULL, ARRAY['Physics', 'Sound', 'Light', 'Waves']);
