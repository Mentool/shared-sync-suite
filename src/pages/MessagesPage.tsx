import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useMessageListener } from "@/hooks/useMessageListener";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMessages } from "@/hooks/useMessages";
import { useConnections } from "@/hooks/useConnections";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MessagesPage = () => {
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  
  const { connections } = useConnections();
  const { messages, sendMessage, isLoading } = useMessages(selectedUserId);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    }
    loadUser();
  }, []);

  const handleNewMessage = useCallback(async (newMessage: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Only show notification if the message is for the current user and from the selected conversation
    if (user && newMessage.receiver_id === user.id && newMessage.sender_id === selectedUserId) {
      toast.success("New message received!", {
        description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? "..." : "")
      });
    }
  }, [selectedUserId]);

  useMessageListener(handleNewMessage);

  const acceptedConnections = connections?.filter(c => c.status === "accepted") || [];

  const handleSendMessage = () => {
    if (message.trim() && selectedUserId) {
      sendMessage({ receiverId: selectedUserId, content: message });
      setMessage("");
    }
  };

  const selectedConnection = acceptedConnections.find(
    c => c.connected_user_id === selectedUserId || c.user_id === selectedUserId
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="h-[calc(100vh-128px)] md:h-[calc(100vh-64px)] flex flex-col px-4 sm:px-6 lg:px-8 py-4 max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">Messages</h1>
          <p className="text-sm text-muted-foreground">Communicate with your co-parent</p>
          
          {acceptedConnections.length > 0 && (
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full mt-3">
                <SelectValue placeholder="Select a connection to chat with" />
              </SelectTrigger>
              <SelectContent>
                {acceptedConnections.map((conn) => {
                  const otherUserId = conn.user_id === currentUserId ? conn.connected_user_id : conn.user_id;
                  return (
                    <SelectItem key={conn.id} value={otherUserId}>
                      {conn.connected_user?.full_name || conn.connected_user?.email || "Unknown User"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {!selectedUserId ? (
          <Card className="flex items-center justify-center flex-1 min-h-0 relative z-10">
            <p className="text-muted-foreground">
              {acceptedConnections.length === 0 
                ? "No connections yet. Add connections to start messaging." 
                : "Select a connection to start chatting"}
            </p>
          </Card>
        ) : (
          <Card className="flex flex-col flex-1 min-h-0 relative z-10">
            <div className="p-4 border-b border-border bg-gradient-warm text-white flex-shrink-0">
              <h2 className="font-semibold text-lg">
                {selectedConnection?.connected_user?.full_name || selectedConnection?.connected_user?.email || "Co-Parent"}
              </h2>
              <p className="text-sm text-white/80">Active now</p>
            </div>
          
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading messages...</p>
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] md:max-w-[70%] rounded-lg p-3 md:p-4 ${
                          isMe
                            ? "bg-gradient-warm text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm md:text-base">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          isMe ? "text-white/70" : "text-muted-foreground"
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
              )}
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
        )}
      </main>
    </div>
  );
};

export default MessagesPage;
