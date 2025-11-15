-- Add foreign key constraints so we can join connections and messages with user profiles
ALTER TABLE public.user_connections
  ADD CONSTRAINT user_connections_user_id_profiles_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;

ALTER TABLE public.user_connections
  ADD CONSTRAINT user_connections_connected_user_id_profiles_fkey
  FOREIGN KEY (connected_user_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_sender_id_profiles_fkey
  FOREIGN KEY (sender_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_receiver_id_profiles_fkey
  FOREIGN KEY (receiver_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;
