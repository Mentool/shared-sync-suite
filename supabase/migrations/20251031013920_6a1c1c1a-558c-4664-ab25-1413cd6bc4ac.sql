-- Create children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on children
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- RLS policies for children
CREATE POLICY "Users can view their own children"
  ON public.children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children"
  ON public.children FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children"
  ON public.children FOR DELETE
  USING (auth.uid() = user_id);

-- Create memory_entries table
CREATE TABLE public.memory_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('photo', 'note', 'milestone')),
  image_url TEXT,
  milestone_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on memory_entries
ALTER TABLE public.memory_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for memory_entries
CREATE POLICY "Users can view entries for their children"
  ON public.memory_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = memory_entries.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create entries for their children"
  ON public.memory_entries FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = memory_entries.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own entries"
  ON public.memory_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON public.memory_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memory_entries_updated_at
  BEFORE UPDATE ON public.memory_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for memory photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-photos', 'memory-photos', true);

-- Storage policies
CREATE POLICY "Users can view memory photos for their children"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memory-photos' AND
    EXISTS (
      SELECT 1 FROM public.memory_entries me
      JOIN public.children c ON c.id = me.child_id
      WHERE c.user_id = auth.uid()
      AND storage.filename(name) = me.image_url
    )
  );

CREATE POLICY "Users can upload memory photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memory-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their memory photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'memory-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their memory photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memory-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );