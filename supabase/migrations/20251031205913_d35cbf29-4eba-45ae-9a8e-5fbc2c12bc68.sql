-- Add recurrence fields to calendar_events table
ALTER TABLE public.calendar_events
ADD COLUMN recurrence_pattern text DEFAULT 'none' CHECK (recurrence_pattern IN ('none', 'daily', 'weekly', 'monthly')),
ADD COLUMN recurrence_end_date date,
ADD COLUMN parent_event_id uuid REFERENCES public.calendar_events(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_calendar_events_parent_id ON public.calendar_events(parent_event_id);

COMMENT ON COLUMN public.calendar_events.recurrence_pattern IS 'Pattern for recurring events: none, daily, weekly, monthly';
COMMENT ON COLUMN public.calendar_events.recurrence_end_date IS 'End date for recurring events';
COMMENT ON COLUMN public.calendar_events.parent_event_id IS 'Reference to parent event for recurring instances';