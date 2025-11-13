import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export interface ConversationMessage {
  id: string;
  user_id: string;
  direction: "sent" | "received";
  content: string;
  created_at: string;
  updated_at: string;
}

export const useMessages = () => {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["messages", user?.id],
    enabled: !authLoading && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ConversationMessage[];
    },
  });

  return {
    messages: query.data ?? [],
    isLoading: authLoading || query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      content,
      direction,
    }: {
      content: string;
      direction: "sent" | "received";
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          user_id: user.id,
          content,
          direction,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ConversationMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send message");
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", user?.id] });
      toast.success("Message removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete message");
    },
  });
};
