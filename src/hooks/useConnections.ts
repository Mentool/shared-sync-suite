import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  connected_user?: {
    email: string;
    full_name: string | null;
  };
}

export const useConnections = () => {
  const queryClient = useQueryClient();

  const { data: connections, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("user_connections")
        .select(`
          *,
          connected_user:profiles(email, full_name)
        `)
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Connection[];
    },
  });

  const sendConnectionRequest = useMutation({
    mutationFn: async (email: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", email)
        .maybeSingle();

      if (profileError) throw new Error("Error searching for user");
      if (!profile) throw new Error("User not found with this email");
      if (profile.user_id === user.id) throw new Error("Cannot connect to yourself");

      const { data, error } = await (supabase as any)
        .from("user_connections")
        .insert([{ user_id: user.id, connected_user_id: profile.user_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connection request sent");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send connection request");
    },
  });

  const updateConnectionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) => {
      const { data, error } = await (supabase as any)
        .from("user_connections")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connection updated");
    },
    onError: (error) => {
      toast.error("Failed to update connection: " + error.message);
    },
  });

  const deleteConnection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("user_connections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connection removed");
    },
    onError: (error) => {
      toast.error("Failed to remove connection: " + error.message);
    },
  });

  return {
    connections,
    isLoading,
    sendConnectionRequest: sendConnectionRequest.mutate,
    updateConnectionStatus: updateConnectionStatus.mutate,
    deleteConnection: deleteConnection.mutate,
  };
};
