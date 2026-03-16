-- Add due_time column to tasks for scheduling tasks at specific times
ALTER TABLE public.tasks ADD COLUMN due_time TIME;
