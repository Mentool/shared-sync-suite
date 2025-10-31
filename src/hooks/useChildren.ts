import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const { data: children, isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Child[];
    },
  });

  const addChild = useMutation({
    mutationFn: async (child: { name: string; date_of_birth?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
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
      queryClient.invalidateQueries({ queryKey: ["children"] });
      toast.success("Child added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add child: " + error.message);
    },
  });

  return {
    children,
    isLoading,
    addChild: addChild.mutate,
  };
};
