import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export interface Child {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export const useChildren = () => {
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const {
    data: children,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["children", user?.id],
    enabled: !authLoading && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Child[];
    },
  });

  const addChild = useMutation({
    mutationFn: async (child: { name: string; date_of_birth?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("children")
        .insert([{ ...child, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", user?.id] });
      toast.success("Child added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add child: " + error.message);
    },
  });

  return {
    children: children ?? [],
    isLoading: authLoading || isLoading,
    error,
    addChild: addChild.mutate,
    isAdding: addChild.isPending,
  };
};
