-- Reassign existing SSC CGL questions from BPSSC SI Mains subjects to SSC CGL subjects
-- Match by subject name between BPSSC SI Mains and SSC CGL papers

-- General Science
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Science' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Science' AND paper = 'BPSSC SI Mains');

-- Indian Polity & Constitution
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Indian Polity & Constitution' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Indian Polity & Constitution' AND paper = 'BPSSC SI Mains');

-- Indian Geography
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Indian Geography' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Indian Geography' AND paper = 'BPSSC SI Mains');

-- Mathematics & Reasoning → General Intelligence & Reasoning
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Intelligence & Reasoning' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Mathematics & Reasoning' AND paper = 'BPSSC SI Mains');

-- English Language → English Comprehension
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'English Comprehension' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'English Language' AND paper = 'BPSSC SI Mains');

-- General Knowledge & Current Affairs → General Awareness
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Awareness' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Knowledge & Current Affairs' AND paper = 'BPSSC SI Mains');

-- Bihar GK & History → Indian History (closest match)
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Indian History' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Bihar GK & History' AND paper = 'BPSSC SI Mains');

-- Hindi Language → General Awareness (no direct SSC CGL equivalent)
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Awareness' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Hindi Language' AND paper = 'BPSSC SI Mains');

-- Also catch SSC CGL questions under UPSC subjects (GS-I, GS-II, GS-III, Prelims)
-- Economy
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Economy' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name = 'Economy' AND paper != 'SSC CGL');

-- Indian History
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Indian History' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name = 'Indian History' AND paper != 'SSC CGL');

-- Current Affairs
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Current Affairs' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name = 'Current Affairs' AND paper != 'SSC CGL');

-- Geography → Indian Geography
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Indian Geography' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name = 'Geography' AND paper != 'SSC CGL');

-- Polity & Governance → Indian Polity & Constitution
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'Indian Polity & Constitution' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name = 'Polity & Governance' AND paper != 'SSC CGL');

-- Science & Technology → General Science
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Science' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name IN ('Science & Technology', 'General Science') AND paper != 'SSC CGL');

-- Environment & Ecology → General Science
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Science' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name = 'Environment & Ecology' AND paper != 'SSC CGL');

-- Art & Culture → General Awareness
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Awareness' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name = 'Art & Culture' AND paper != 'SSC CGL');

-- Social Issues / Social Justice / Indian Society → General Awareness
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Awareness' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name IN ('Social Issues', 'Social Justice', 'Indian Society') AND paper != 'SSC CGL');

-- Security & Defence / Disaster Management → General Awareness
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Awareness' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name IN ('Security & Defence', 'Disaster Management') AND paper != 'SSC CGL');

-- International Relations / Ethics & Integrity / World History → General Awareness
UPDATE public.quiz_questions
SET subject_id = (SELECT id FROM public.quiz_subjects WHERE name = 'General Awareness' AND paper = 'SSC CGL')
WHERE pyq_exam = 'SSC CGL'
  AND subject_id IN (SELECT id FROM public.quiz_subjects WHERE name IN ('International Relations', 'Ethics & Integrity', 'World History') AND paper != 'SSC CGL');
