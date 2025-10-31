import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MemoryEntry {
  id: string;
  child_id: string;
  user_id: string;
  title: string;
  content: string | null;
  entry_type: "photo" | "note" | "milestone";
  image_url: string | null;
  milestone_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useMemoryEntries = (childId?: string) => {
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useQuery({
    queryKey: ["memory-entries", childId],
    queryFn: async () => {
      let query = supabase
        .from("memory_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (childId) {
        query = query.eq("child_id", childId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MemoryEntry[];
    },
    enabled: !!childId || childId === undefined,
  });

  const addEntry = useMutation({
    mutationFn: async (entry: {
      child_id: string;
      title: string;
      content?: string;
      entry_type: "photo" | "note" | "milestone";
      image_url?: string;
      milestone_date?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("memory_entries")
        .insert([{ ...entry, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory-entries"] });
      toast.success("Memory added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add memory: " + error.message);
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("memory_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory-entries"] });
      toast.success("Memory deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete memory: " + error.message);
    },
  });

  const uploadPhoto = async (file: File, userId: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("memory-photos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("memory-photos")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  return {
    entries,
    isLoading,
    addEntry: addEntry.mutate,
    deleteEntry: deleteEntry.mutate,
    uploadPhoto,
  };
};
