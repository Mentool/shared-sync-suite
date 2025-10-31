import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  type: "pickup" | "medical" | "custody" | "school" | "activity" | "other";
  created_at: string;
  updated_at: string;
}

export const useCalendarEvents = () => {
  return useQuery({
    queryKey: ["calendar_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
};

export const useAddCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      title: string;
      description?: string;
      event_date: string;
      event_time?: string;
      type: CalendarEvent["type"];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to add events");
      }

      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          user_id: user.id,
          ...event,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
      toast.success("Event added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add event");
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
      toast.success("Event deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });
};
