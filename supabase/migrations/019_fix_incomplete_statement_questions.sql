-- Deactivate statement-based questions that are missing their actual statements.
-- These are questions where options reference (I), (II), (III) etc. but the
-- question_text doesn't contain any numbered statements — likely due to
-- incomplete bulk imports where Claude omitted the statement list.

UPDATE public.quiz_questions
SET is_active = false
WHERE is_active = true
  AND (
    -- Options reference roman numeral statements but question_text doesn't contain them
    (
      (option_a ~* '\(I\)|\(II\)|\(III\)' OR option_b ~* '\(I\)|\(II\)|\(III\)' OR option_c ~* '\(I\)|\(II\)|\(III\)' OR option_d ~* '\(I\)|\(II\)|\(III\)')
      AND question_text !~* '\(I\)|\(II\)|\(III\)'
    )
    OR
    -- Question says "consider the following statements" but has no newlines (no listed statements)
    (
      question_text ~* 'consider the following'
      AND question_text NOT LIKE E'%\n%'
    )
  );
