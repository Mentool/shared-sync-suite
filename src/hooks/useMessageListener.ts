import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMessageListener(callback: (message: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [callback]);
}
