import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  type: "pickup" | "medical" | "custody" | "school" | "activity" | "other";
  recurrence_pattern: "none" | "daily" | "weekly" | "biweekly" | "monthly";
  recurrence_end_date: string | null;
  parent_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useCalendarEvents = () => {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["calendar_events", user?.id],
    enabled: !authLoading && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user!.id)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
};

export const useAddCalendarEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (event: {
      title: string;
      description?: string;
      event_date: string;
      event_time?: string;
      type: CalendarEvent["type"];
      recurrence_pattern?: CalendarEvent["recurrence_pattern"];
      recurrence_end_date?: string;
    }) => {
      if (!user) {
        throw new Error("You must be logged in to add events");
      }

      // Create the main event
      const { data: mainEvent, error: mainError } = await supabase
        .from("calendar_events")
        .insert({
          user_id: user.id,
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          event_time: event.event_time,
          type: event.type,
          recurrence_pattern: event.recurrence_pattern || "none",
          recurrence_end_date: event.recurrence_end_date,
        })
        .select()
        .single();

      if (mainError) throw mainError;

      // Generate recurring instances if needed
      if (event.recurrence_pattern && event.recurrence_pattern !== "none" && event.recurrence_end_date) {
        const recurringEvents = generateRecurringEvents(mainEvent as CalendarEvent, event.recurrence_end_date);
        
        if (recurringEvents.length > 0) {
          const { error: recurringError } = await supabase
            .from("calendar_events")
            .insert(recurringEvents);

          if (recurringError) throw recurringError;
        }
      }

      return mainEvent;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["calendar_events", user?.id] });
      toast.success("Event added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add event");
    },
  });
};

// Helper function to generate recurring event instances
const generateRecurringEvents = (
  parentEvent: CalendarEvent,
  endDate: string
): Array<{
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  type: CalendarEvent["type"];
  recurrence_pattern: string;
  parent_event_id: string;
}> => {
  const events = [];
  const startDate = new Date(parentEvent.event_date);
  const end = new Date(endDate);
  const currentDate = new Date(startDate);

  // Move to next occurrence based on pattern
  switch (parentEvent.recurrence_pattern) {
    case "daily":
      currentDate.setDate(currentDate.getDate() + 1);
      break;
    case "weekly":
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case "biweekly":
      currentDate.setDate(currentDate.getDate() + 14);
      break;
    case "monthly":
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
  }

  while (currentDate <= end) {
    events.push({
      user_id: parentEvent.user_id,
      title: parentEvent.title,
      description: parentEvent.description,
      event_date: currentDate.toISOString().split("T")[0],
      event_time: parentEvent.event_time,
      type: parentEvent.type,
      recurrence_pattern: "none",
      parent_event_id: parentEvent.id,
    });

    // Move to next occurrence
    switch (parentEvent.recurrence_pattern) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case "biweekly":
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
  }

  return events;
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events", user?.id] });
      toast.success("Event deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });
};
