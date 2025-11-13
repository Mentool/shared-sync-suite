import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  type: "sent" | "received";
  status: "pending" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export const usePayments = () => {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["payments", user?.id],
    enabled: !authLoading && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
  });

  return {
    payments: query.data ?? [],
    isLoading: authLoading || query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useSendPayment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      amount,
      description,
      type,
      status,
    }: {
      amount: number;
      description: string;
      type: Payment["type"];
      status: Payment["status"];
    }) => {
      if (!user) {
        throw new Error("You must be logged in to send payments");
      }

      const { data, error } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount,
          description,
          type,
          status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["payments", user?.id] });
      toast.success("Payment sent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send payment");
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      id, 
      amount, 
      description, 
      type,
      status,
    }: { 
      id: string; 
      amount: number; 
      description: string; 
      type: "sent" | "received";
      status: "pending" | "completed" | "failed";
    }) => {
      const { data, error } = await supabase
        .from("payments")
        .update({
          amount,
          description,
          type,
          status,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", user?.id] });
      toast.success("Payment updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payment");
    },
  });
};
