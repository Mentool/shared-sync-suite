-- Add foreign key constraints to user_connections table
ALTER TABLE public.user_connections
ADD CONSTRAINT user_connections_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.user_connections
ADD CONSTRAINT user_connections_connected_user_id_fkey 
FOREIGN KEY (connected_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;