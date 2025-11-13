import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Send, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMessages, useSendMessage, useDeleteMessage } from "@/hooks/useMessages";

const MessagesPage = () => {
  const [message, setMessage] = useState("");
  const [direction, setDirection] = useState<"sent" | "received">("sent");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading } = useMessages();
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const orderedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages]
  );

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessage.mutate(
      { content: message.trim(), direction },
      {
        onSuccess: () => {
          setMessage("");
        },
      }
    );
  };

  const handleDeleteMessage = (id: string) => {
    deleteMessage.mutate(id);
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
            <h2 className="font-semibold text-lg">Co-Parent Conversation</h2>
            <p className="text-sm text-white/80">Keep all communications organized</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
            {isLoading ? (
              <div className="text-center py-10 text-muted-foreground">Loading messages...</div>
            ) : orderedMessages.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No messages yet. Start the conversation below.
              </div>
            ) : (
              orderedMessages.map((msg) => {
                const isSent = msg.direction === "sent";
                const bubbleClasses = isSent
                  ? "bg-gradient-warm text-white"
                  : "bg-muted text-foreground";
                const metaTextClasses = isSent ? "text-white/70" : "text-muted-foreground";
                const senderLabel = isSent ? "You" : "Co-Parent";

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSent ? "justify-end" : "justify-start"} group`}
                  >
                    <div
                      className={`max-w-[75%] md:max-w-[70%] rounded-lg p-3 md:p-4 shadow-sm transition-all ${bubbleClasses}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="bg-white/20 text-white uppercase tracking-wide text-[10px]">
                          {senderLabel}
                        </Badge>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className={`rounded-full p-1 transition-opacity ${isSent ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"} opacity-0 group-hover:opacity-100`}
                          aria-label="Delete message"
                          disabled={deleteMessage.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm md:text-base whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-xs mt-2 ${metaTextClasses}`}>
                        {format(new Date(msg.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 md:p-6 border-t border-border bg-card flex-shrink-0 relative z-20 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Select value={direction} onValueChange={(value) => setDirection(value as "sent" | "received")}>
                <SelectTrigger className="w-full md:w-[220px] bg-background">
                  <SelectValue placeholder="Message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sent">Message you sent</SelectItem>
                  <SelectItem value="received">Message you received</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sent messages are shown on the right. Received messages appear on the left.
              </p>
            </div>
            <div className="flex gap-2 md:gap-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-12 bg-background relative z-20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sendMessage.isPending}
              />
              <Button 
                variant="warm" 
                size="icon" 
                className="h-12 w-12 flex-shrink-0 relative z-20"
                onClick={handleSendMessage}
                disabled={sendMessage.isPending}
              >
                {sendMessage.isPending ? (
                  <span className="text-xs font-medium">...</span>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default MessagesPage;
