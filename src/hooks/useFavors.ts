import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Favor {
  id: string;
  requester_id: string;
  responder_id: string | null;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useFavors = () => {
  const queryClient = useQueryClient();

  const { data: favors, isLoading } = useQuery({
    queryKey: ["favors"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("favors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Favor[];
    },
  });

  const createFavor = useMutation({
    mutationFn: async ({ responderId, title, description }: { 
      responderId: string; 
      title: string; 
      description?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("favors")
        .insert([{ 
          requester_id: user.id, 
          responder_id: responderId,
          title,
          description 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favors"] });
      toast.success("Favor request sent!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send favor request");
    },
  });

  const updateFavorStatus = useMutation({
    mutationFn: async ({ favorId, status }: { favorId: string; status: string }) => {
      const { error } = await supabase
        .from("favors")
        .update({ status })
        .eq("id", favorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favors"] });
      toast.success("Favor status updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update favor status");
    },
  });

  const deleteFavor = useMutation({
    mutationFn: async (favorId: string) => {
      const { error } = await supabase
        .from("favors")
        .delete()
        .eq("id", favorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favors"] });
      toast.success("Favor request deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete favor request");
    },
  });

  return {
    favors,
    isLoading,
    createFavor: createFavor.mutate,
    updateFavorStatus: updateFavorStatus.mutate,
    deleteFavor: deleteFavor.mutate,
  };
};