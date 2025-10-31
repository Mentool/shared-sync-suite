-- Update recurrence_pattern to include biweekly
ALTER TABLE public.calendar_events
DROP CONSTRAINT IF EXISTS calendar_events_recurrence_pattern_check;

ALTER TABLE public.calendar_events
ADD CONSTRAINT calendar_events_recurrence_pattern_check 
CHECK (recurrence_pattern IN ('none', 'daily', 'weekly', 'biweekly', 'monthly'));