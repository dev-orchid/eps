-- Seed practice MCQs from BPSC TRE 4.0 CS Preparation Guide
-- Based on PYQ patterns from TRE 1.0, 2.0, and 3.0

-- Programming & Data Structures Questions
INSERT INTO public.quiz_questions
  (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_exam, tags, is_active)
VALUES
  -- Q1: Programming
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Programming (C/C++/Python)' AND paper = 'BPSC TRE 4.0 CS'),
   'What is the output of the following C code?\nint a = 5, b = 3; printf("%d", a++ + ++b);',
   '8', '9', '10', '11',
   'B', 'a++ is post-increment so a is used as 5, ++b is pre-increment so b becomes 4. Result: 5 + 4 = 9.',
   'medium', 'manual', 'BPSC TRE', ARRAY['c-programming', 'operators', 'increment'], true),

  -- Q4: Python
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Programming (C/C++/Python)' AND paper = 'BPSC TRE 4.0 CS'),
   'What is the output? x = [1,2,3]; x.append([4,5]); print(len(x))',
   '3', '4', '5', 'Error',
   'B', 'append() adds [4,5] as a single element to the list, making x = [1, 2, 3, [4, 5]]. Length is 4.',
   'medium', 'manual', 'BPSC TRE', ARRAY['python', 'lists', 'append'], true),

  -- Q7: Arrays
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Programming (C/C++/Python)' AND paper = 'BPSC TRE 4.0 CS'),
   'The address of arr[3] in an integer array starting at address 1000 (size of int = 4 bytes) is:',
   '1003', '1006', '1012', '1016',
   'C', 'Address of arr[i] = Base + i * sizeof(element) = 1000 + 3 * 4 = 1012.',
   'easy', 'manual', 'BPSC TRE', ARRAY['arrays', 'memory-address', 'c-programming'], true);

-- Data Structures Questions
INSERT INTO public.quiz_questions
  (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_exam, tags, is_active)
VALUES
  -- Q2: Stack
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Data Structures' AND paper = 'BPSC TRE 4.0 CS'),
   'Which data structure uses LIFO principle?',
   'Queue', 'Stack', 'Linked List', 'Array',
   'B', 'Stack follows Last In, First Out (LIFO) principle where the last element inserted is the first to be removed.',
   'easy', 'manual', 'BPSC TRE', ARRAY['stack', 'lifo', 'basics'], true),

  -- Q3: Binary Search
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Data Structures' AND paper = 'BPSC TRE 4.0 CS'),
   'Time complexity of binary search is:',
   'O(n)', 'O(n²)', 'O(log n)', 'O(n log n)',
   'C', 'Binary search divides the search space in half each time, giving O(log n) time complexity.',
   'easy', 'manual', 'BPSC TRE', ARRAY['binary-search', 'time-complexity', 'searching'], true),

  -- Q5: Circular Queue
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Data Structures' AND paper = 'BPSC TRE 4.0 CS'),
   'In a circular queue with size 5, if front=3 and rear=1, how many elements are in the queue?',
   '2', '3', '4', '5',
   'B', 'Number of elements = (rear - front + size) % size = (1 - 3 + 5) % 5 = 3.',
   'medium', 'manual', 'BPSC TRE', ARRAY['circular-queue', 'queue'], true),

  -- Q6: Sorting
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Data Structures' AND paper = 'BPSC TRE 4.0 CS'),
   'Which sorting algorithm has the best average case time complexity?',
   'Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort',
   'C', 'Merge Sort has O(n log n) average case time complexity, which is better than O(n²) of others.',
   'easy', 'manual', 'BPSC TRE', ARRAY['sorting', 'merge-sort', 'time-complexity'], true),

  -- Q8: Recursion
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Data Structures' AND paper = 'BPSC TRE 4.0 CS'),
   'Recursion uses which data structure internally?',
   'Queue', 'Array', 'Stack', 'Tree',
   'C', 'Recursion uses the call stack internally. Each recursive call is pushed onto the stack and popped when it returns.',
   'easy', 'manual', 'BPSC TRE', ARRAY['recursion', 'stack', 'function-calls'], true);

-- DBMS & SQL Questions
INSERT INTO public.quiz_questions
  (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_exam, tags, is_active)
VALUES
  -- Q9: SQL TRUNCATE
  ((SELECT id FROM public.quiz_subjects WHERE name = 'DBMS & SQL' AND paper = 'BPSC TRE 4.0 CS'),
   'Which SQL command is used to remove all rows from a table without deleting the table structure?',
   'DELETE', 'DROP', 'TRUNCATE', 'REMOVE',
   'C', 'TRUNCATE removes all rows from a table but keeps the table structure intact. DROP removes the table entirely. DELETE can also remove rows but is slower and logged.',
   'easy', 'manual', 'BPSC TRE', ARRAY['sql', 'ddl', 'truncate'], true),

  -- Q10: Normalization
  ((SELECT id FROM public.quiz_subjects WHERE name = 'DBMS & SQL' AND paper = 'BPSC TRE 4.0 CS'),
   'A table in 2NF but not in 3NF has which type of dependency?',
   'Partial dependency', 'Full dependency', 'Transitive dependency', 'Multi-valued dependency',
   'C', 'A table in 2NF has no partial dependencies. If it is not in 3NF, it has transitive dependencies where non-key attributes depend on other non-key attributes.',
   'medium', 'manual', 'BPSC TRE', ARRAY['normalization', '2nf', '3nf', 'transitive-dependency'], true),

  -- Q11: SQL Query
  ((SELECT id FROM public.quiz_subjects WHERE name = 'DBMS & SQL' AND paper = 'BPSC TRE 4.0 CS'),
   'SELECT COUNT(*) FROM Student WHERE marks > 80 GROUP BY class HAVING COUNT(*) > 5; What does this query return?',
   'Total students with marks > 80', 'Classes where more than 5 students scored above 80', 'All students grouped by class', 'Error',
   'B', 'The query groups students by class, filters those with marks > 80, and returns only groups (classes) having more than 5 such students.',
   'medium', 'manual', 'BPSC TRE', ARRAY['sql', 'group-by', 'having', 'aggregate'], true),

  -- Q12: Foreign Key
  ((SELECT id FROM public.quiz_subjects WHERE name = 'DBMS & SQL' AND paper = 'BPSC TRE 4.0 CS'),
   'Which key is used to link two tables in a relational database?',
   'Primary Key', 'Candidate Key', 'Foreign Key', 'Super Key',
   'C', 'A Foreign Key in one table references the Primary Key of another table, establishing a link between the two tables.',
   'easy', 'manual', 'BPSC TRE', ARRAY['keys', 'foreign-key', 'relational-database'], true);

-- Boolean Algebra & Logic Gates Questions
INSERT INTO public.quiz_questions
  (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_exam, tags, is_active)
VALUES
  -- Q13: Boolean Simplification
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Boolean Algebra & Logic Gates' AND paper = 'BPSC TRE 4.0 CS'),
   'Simplify using Boolean algebra: A + A''B = ?',
   'A', 'A + B', 'A''B', 'B',
   'B', 'A + A''B = A(1 + B) + A''B = A + AB + A''B = A + B(A + A'') = A + B.',
   'medium', 'manual', 'BPSC TRE', ARRAY['boolean-algebra', 'simplification'], true),

  -- Q14: Universal Gate
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Boolean Algebra & Logic Gates' AND paper = 'BPSC TRE 4.0 CS'),
   'Which gate is called the universal gate?',
   'AND', 'OR', 'XOR', 'NAND',
   'D', 'NAND and NOR are called universal gates because any Boolean function can be implemented using only NAND gates (or only NOR gates).',
   'easy', 'manual', 'BPSC TRE', ARRAY['logic-gates', 'universal-gate', 'nand'], true),

  -- Q15: De Morgan's Theorem
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Boolean Algebra & Logic Gates' AND paper = 'BPSC TRE 4.0 CS'),
   'De Morgan''s theorem states that (A+B)'' = ?',
   'A''+B''', 'A''.B''', 'A.B', '(A.B)''',
   'B', 'De Morgan''s theorem: (A+B)'' = A''.B'' — the complement of a sum equals the product of the complements.',
   'easy', 'manual', 'BPSC TRE', ARRAY['boolean-algebra', 'de-morgans-theorem'], true);

-- Computer Networks Questions
INSERT INTO public.quiz_questions
  (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_exam, tags, is_active)
VALUES
  -- Q16: OSI Model
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Computer Networks' AND paper = 'BPSC TRE 4.0 CS'),
   'Which layer of the OSI model is responsible for routing?',
   'Data Link', 'Transport', 'Network', 'Session',
   'C', 'The Network layer (Layer 3) handles routing — determining the path data takes from source to destination across networks.',
   'easy', 'manual', 'BPSC TRE', ARRAY['osi-model', 'network-layer', 'routing'], true),

  -- Q17: TCP
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Computer Networks' AND paper = 'BPSC TRE 4.0 CS'),
   'Full form of TCP is:',
   'Transfer Control Protocol', 'Transmission Control Protocol', 'Total Communication Protocol', 'Transport Communication Protocol',
   'B', 'TCP stands for Transmission Control Protocol. It provides reliable, ordered, and error-checked delivery of data.',
   'easy', 'manual', 'BPSC TRE', ARRAY['tcp', 'protocols', 'basics'], true),

  -- Q18: Topology
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Computer Networks' AND paper = 'BPSC TRE 4.0 CS'),
   'Which topology has a single point of failure at the central device?',
   'Bus', 'Ring', 'Star', 'Mesh',
   'C', 'In Star topology, all devices connect to a central hub/switch. If the central device fails, the entire network goes down.',
   'easy', 'manual', 'BPSC TRE', ARRAY['topology', 'star-topology', 'network'], true);

-- Number Systems Questions
INSERT INTO public.quiz_questions
  (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_exam, tags, is_active)
VALUES
  -- Q19: Binary to Decimal
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Number Systems & Codes' AND paper = 'BPSC TRE 4.0 CS'),
   'Convert (1011.01)₂ to decimal:',
   '11.25', '11.5', '10.25', '10.5',
   'A', '1×2³ + 0×2² + 1×2¹ + 1×2⁰ + 0×2⁻¹ + 1×2⁻² = 8 + 0 + 2 + 1 + 0 + 0.25 = 11.25.',
   'medium', 'manual', 'BPSC TRE', ARRAY['number-systems', 'binary', 'conversion'], true),

  -- Q20: 2's Complement
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Number Systems & Codes' AND paper = 'BPSC TRE 4.0 CS'),
   'The 2''s complement of 1010 is:',
   '0101', '0110', '1001', '1010',
   'B', '1''s complement of 1010 = 0101. Add 1: 0101 + 1 = 0110. So 2''s complement is 0110.',
   'medium', 'manual', 'BPSC TRE', ARRAY['number-systems', '2s-complement', 'binary'], true);

-- General Studies Questions
INSERT INTO public.quiz_questions
  (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_exam, tags, is_active)
VALUES
  -- Q21: Bihar GK
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Bihar Specific GK' AND paper = 'BPSC TRE 4.0 CS'),
   'Patna is situated on the bank of which river?',
   'Ganga', 'Kosi', 'Gandak', 'Son',
   'A', 'Patna, the capital of Bihar, is situated on the southern bank of the river Ganga.',
   'easy', 'manual', 'BPSC TRE', ARRAY['bihar-gk', 'geography', 'patna'], true),

  -- Q24: Bihar History
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Bihar Specific GK' AND paper = 'BPSC TRE 4.0 CS'),
   'Which ancient university was located in present-day Bihar?',
   'Takshashila', 'Vikramashila', 'Ujjain', 'Kashi',
   'B', 'Vikramashila was an ancient university located in present-day Bhagalpur district, Bihar. Founded by King Dharmapala of the Pala dynasty.',
   'easy', 'manual', 'BPSC TRE', ARRAY['bihar-gk', 'history', 'ancient-universities'], true);

-- Indian Polity Question
INSERT INTO public.quiz_questions
  (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_exam, tags, is_active)
VALUES
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Indian Polity & Constitution' AND paper = 'BPSC TRE 4.0 CS'),
   'The Panchayati Raj system in India was established based on the recommendations of which committee?',
   'Ashok Mehta', 'Balwant Rai Mehta', 'L.M. Singhvi', 'G.V.K. Rao',
   'B', 'The Panchayati Raj system was first recommended by the Balwant Rai Mehta Committee in 1957 and was first adopted by Rajasthan in 1959.',
   'easy', 'manual', 'BPSC TRE', ARRAY['polity', 'panchayati-raj', 'committees'], true);

-- Mental Ability & Reasoning Question
INSERT INTO public.quiz_questions
  (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_exam, tags, is_active)
VALUES
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Mental Ability & Reasoning' AND paper = 'BPSC TRE 4.0 CS'),
   'If in a coded language, COMPUTER is written as DPNQVUFS, then how will TEACHER be written?',
   'UFBDIFS', 'UFBDIGS', 'UFBDIES', 'UFBDIFS',
   'A', 'Each letter is shifted by +1 in the alphabet. T→U, E→F, A→B, C→D, H→I, E→F, R→S = UFBDIFS.',
   'medium', 'manual', 'BPSC TRE', ARRAY['reasoning', 'coding-decoding', 'alphabet'], true);

-- Basic Mathematics Question
INSERT INTO public.quiz_questions
  (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_exam, tags, is_active)
VALUES
  ((SELECT id FROM public.quiz_subjects WHERE name = 'Basic Mathematics' AND paper = 'BPSC TRE 4.0 CS'),
   'If the ratio of boys to girls in a class is 3:2 and total students are 60, how many girls are there?',
   '20', '24', '30', '36',
   'B', 'Total parts = 3 + 2 = 5. Girls = (2/5) × 60 = 24.',
   'easy', 'manual', 'BPSC TRE', ARRAY['ratio', 'mathematics', 'basics'], true);
