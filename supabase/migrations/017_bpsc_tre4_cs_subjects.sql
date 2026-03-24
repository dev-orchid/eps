-- Add BPSC TRE 4.0 Computer Science (PGT) subjects
-- Exam: BPSC TRE 4.0 CS | Total: 150 marks (Language 30 + GS 40 + CS 80)
-- Duration: 2 Hours 30 Minutes | No Negative Marking

-- Part A: Language Paper (30 Marks – Qualifying Only)
INSERT INTO public.quiz_subjects (name, paper, exam_type, sort_order) VALUES
  ('English Language', 'BPSC TRE 4.0 CS', 'State PSC', 301),
  ('Hindi Language', 'BPSC TRE 4.0 CS', 'State PSC', 302);

-- Part B: General Studies (40 Marks – Counts for Merit)
INSERT INTO public.quiz_subjects (name, paper, exam_type, sort_order) VALUES
  ('Mental Ability & Reasoning', 'BPSC TRE 4.0 CS', 'State PSC', 310),
  ('Bihar Specific GK', 'BPSC TRE 4.0 CS', 'State PSC', 311),
  ('Current Affairs', 'BPSC TRE 4.0 CS', 'State PSC', 312),
  ('Basic Mathematics', 'BPSC TRE 4.0 CS', 'State PSC', 313),
  ('Indian History', 'BPSC TRE 4.0 CS', 'State PSC', 314),
  ('Indian Polity & Constitution', 'BPSC TRE 4.0 CS', 'State PSC', 315),
  ('Geography (India & Bihar)', 'BPSC TRE 4.0 CS', 'State PSC', 316),
  ('General Science', 'BPSC TRE 4.0 CS', 'State PSC', 317),
  ('Indian Economy & Bihar Economy', 'BPSC TRE 4.0 CS', 'State PSC', 318);

-- Part C: Computer Science (80 Marks – Highest Weightage)
INSERT INTO public.quiz_subjects (name, paper, exam_type, sort_order) VALUES
  ('Programming (C/C++/Python)', 'BPSC TRE 4.0 CS', 'State PSC', 320),
  ('Data Structures', 'BPSC TRE 4.0 CS', 'State PSC', 321),
  ('DBMS & SQL', 'BPSC TRE 4.0 CS', 'State PSC', 322),
  ('Boolean Algebra & Logic Gates', 'BPSC TRE 4.0 CS', 'State PSC', 323),
  ('Computer Networks', 'BPSC TRE 4.0 CS', 'State PSC', 324),
  ('Number Systems & Codes', 'BPSC TRE 4.0 CS', 'State PSC', 325),
  ('Internet & Web Technologies', 'BPSC TRE 4.0 CS', 'State PSC', 326),
  ('Operating Systems', 'BPSC TRE 4.0 CS', 'State PSC', 327),
  ('Computer Fundamentals', 'BPSC TRE 4.0 CS', 'State PSC', 328),
  ('Computer Architecture', 'BPSC TRE 4.0 CS', 'State PSC', 329),
  ('Software Engineering', 'BPSC TRE 4.0 CS', 'State PSC', 330),
  ('Information Security', 'BPSC TRE 4.0 CS', 'State PSC', 331),
  ('Math Foundations for CS', 'BPSC TRE 4.0 CS', 'State PSC', 332);
