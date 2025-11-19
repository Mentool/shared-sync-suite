-- Create favors table for users to request help from connected users
CREATE TABLE public.favors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  responder_id UUID NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.favors ENABLE ROW LEVEL SECURITY;

-- Users can create favor requests to connected users
CREATE POLICY "Users can create favor requests"
ON public.favors
FOR INSERT
WITH CHECK (
  auth.uid() = requester_id
  AND EXISTS (
    SELECT 1 FROM user_connections
    WHERE status = 'accepted'
    AND (
      (user_id = auth.uid() AND connected_user_id = responder_id)
      OR (connected_user_id = auth.uid() AND user_id = responder_id)
    )
  )
);

-- Users can view favors they created or are assigned to
CREATE POLICY "Users can view their favors"
ON public.favors
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = responder_id);

-- Users can update favors they're involved in
CREATE POLICY "Users can update their favors"
ON public.favors
FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = responder_id);

-- Users can delete favors they created
CREATE POLICY "Users can delete their own favor requests"
ON public.favors
FOR DELETE
USING (auth.uid() = requester_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_favors_updated_at
BEFORE UPDATE ON public.favors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();