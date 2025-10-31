import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
  });
};

export const useSendPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to send payments");
      }

      const { data, error } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount,
          description,
          type: "sent",
          status: "completed",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment sent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send payment");
    },
  });
};
