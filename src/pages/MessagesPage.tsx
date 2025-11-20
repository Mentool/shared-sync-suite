import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState, useCallback } from "react";
import { useMessageListener } from "@/hooks/useMessageListener";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MessagesPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "co-parent", text: "Hi, can we discuss the summer schedule?", time: "10:30 AM" },
    { id: 2, sender: "me", text: "Of course! What dates did you have in mind?", time: "10:45 AM" },
    { id: 3, sender: "co-parent", text: "I was thinking the first two weeks of July for my vacation time", time: "11:00 AM" },
    { id: 4, sender: "me", text: "That works for me. I'll plan for the last two weeks of July then.", time: "11:15 AM" },
    { id: 5, sender: "co-parent", text: "Perfect! I'll update the calendar.", time: "11:20 AM" },
  ]);

  const handleNewMessage = useCallback(async (newMessage: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Only show notification if the message is for the current user (not sent by them)
    if (user && newMessage.receiver_id === user.id) {
      toast.success("New message received!", {
        description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? "..." : "")
      });
    }
  }, []);

  useMessageListener(handleNewMessage);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "me",
        text: message,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="h-[calc(100vh-128px)] md:h-[calc(100vh-64px)] flex flex-col px-4 sm:px-6 lg:px-8 py-4 max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">Messages</h1>
          <p className="text-sm text-muted-foreground">Communicate with your co-parent</p>
        </div>
        
        <Card className="flex flex-col flex-1 min-h-0 relative z-10">
          <div className="p-4 border-b border-border bg-gradient-warm text-white flex-shrink-0">
            <h2 className="font-semibold text-lg">Co-Parent</h2>
            <p className="text-sm text-white/80">Active now</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] md:max-w-[70%] rounded-lg p-3 md:p-4 ${
                    msg.sender === "me"
                      ? "bg-gradient-warm text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm md:text-base">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === "me" ? "text-white/70" : "text-muted-foreground"
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 md:p-6 border-t border-border bg-card flex-shrink-0 relative z-20">
            <div className="flex gap-2 md:gap-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-12 bg-background relative z-20"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                variant="warm" 
                size="icon" 
                className="h-12 w-12 flex-shrink-0 relative z-20"
                onClick={handleSendMessage}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default MessagesPage;
