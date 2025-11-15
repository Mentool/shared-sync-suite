import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, MessageCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddConnectionDialog } from "@/components/AddConnectionDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useConnections, Connection } from "@/hooks/useConnections";
import { useMessages } from "@/hooks/useMessages";

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { connections, isLoading: connectionsLoading } = useConnections();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);
  const readTrackerRef = useRef<Set<string>>(new Set());

  const acceptedConnections = useMemo(
    () => (connections ?? []).filter((connection) => connection.status === "accepted"),
    [connections]
  );

  const currentConnection = useMemo(() => {
    if (!selectedUserId) return undefined;
    return acceptedConnections.find(
      (connection) => getOtherParticipantId(connection, user?.id) === selectedUserId
    );
  }, [acceptedConnections, selectedUserId, user?.id]);

  const otherProfile = useMemo(() => {
    if (!currentConnection || !user?.id) return null;
    return currentConnection.user_id === user.id
      ? currentConnection.recipient_profile
      : currentConnection.requester_profile;
  }, [currentConnection, user?.id]);

  const {
    messages,
    isLoading: messagesLoading,
    sendMessageAsync,
    isSending,
    markAsRead,
  } = useMessages(selectedUserId ?? undefined);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    const availableUserIds = acceptedConnections
      .map((connection) => getOtherParticipantId(connection, user.id))
      .filter(Boolean) as string[];

    if (availableUserIds.length === 0) {
      setSelectedUserId(null);
      return;
    }

    if (selectedUserId && availableUserIds.includes(selectedUserId)) {
      return;
    }

    setSelectedUserId(availableUserIds[0]);
  }, [acceptedConnections, selectedUserId, user?.id]);

  useEffect(() => {
    readTrackerRef.current.clear();
  }, [selectedUserId]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!messages || !user?.id) return;

    messages.forEach((msg) => {
      const shouldMark = !msg.read && msg.receiver_id === user.id && !readTrackerRef.current.has(msg.id);
      if (shouldMark) {
        readTrackerRef.current.add(msg.id);
        markAsRead(msg.id);
      }
    });
  }, [messages, user?.id, markAsRead]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUserId) return;
    const content = message.trim();
    try {
      await sendMessageAsync({ receiverId: selectedUserId, content });
      setMessage("");
    } catch {
      // Error is handled inside the hook via toast
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const renderConnectionButton = (connection: Connection) => {
    const otherUserId = getOtherParticipantId(connection, user?.id);
    const isActive = otherUserId && otherUserId === selectedUserId;
    const profile =
      connection.user_id === user?.id ? connection.recipient_profile : connection.requester_profile;
    const displayName = profile?.full_name || profile?.email || "Unknown user";
    const displayInitial =
      profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "U";

    return (
      <button
        key={connection.id}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors text-left",
          isActive ? "bg-gradient-warm text-white" : "hover:bg-muted"
        )}
        onClick={() => {
          if (otherUserId) {
            setSelectedUserId(otherUserId);
          }
        }}
      >
        <Avatar className="h-10 w-10">
          <AvatarFallback className={isActive ? "bg-white/20 text-white" : undefined}>
            {displayInitial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-semibold">{displayName}</p>
          <p className={cn("text-xs", isActive ? "text-white/80" : "text-muted-foreground")}>
            {profile?.email}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="px-4 sm:px-6 lg:px-8 py-4 max-w-6xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Messages</h1>
          <p className="text-sm text-muted-foreground">Message your accepted connections in real time</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
          <Card className="p-4 flex flex-col h-[60vh] lg:h-[70vh]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Connections</h2>
                <p className="text-xs text-muted-foreground">Select someone to chat with</p>
              </div>
              <AddConnectionDialog />
            </div>

            {connectionsLoading ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Loading connections...
              </div>
            ) : acceptedConnections.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground">
                <MessageCircle className="w-10 h-10" />
                <div>
                  <p className="font-medium text-foreground">No accepted connections yet</p>
                  <p className="text-sm">Send a connection request from your profile to start messaging.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                  Manage connections
                </Button>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {acceptedConnections.map((connection) => renderConnectionButton(connection))}
                </div>
              </ScrollArea>
            )}
          </Card>

          <Card className="flex flex-col h-[70vh]">
            {!selectedUserId || !currentConnection ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 text-muted-foreground">
                <MessageCircle className="w-10 h-10" />
                <div>
                  <p className="font-medium text-foreground">Select someone to start chatting</p>
                  <p className="text-sm">Choose a connection from the list to view your conversation.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">
                      {otherProfile?.full_name || otherProfile?.email || "Conversation"}
                    </p>
                    <p className="text-xs text-muted-foreground">{otherProfile?.email}</p>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>

                <div ref={messageListRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Loading messages...
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((msg) => {
                      const isOwnMessage = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[80%] rounded-lg p-3 shadow-sm",
                              isOwnMessage ? "bg-gradient-warm text-white" : "bg-muted"
                            )}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={cn("text-[11px] mt-1", isOwnMessage ? "text-white/80" : "text-muted-foreground")}>
                              {formatMessageTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      No messages yet. Say hello!
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 h-12 bg-background"
                      disabled={isSending}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      variant="warm"
                      size="icon"
                      className="h-12 w-12 flex-shrink-0"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                  {isSending && <p className="text-xs text-muted-foreground mt-2">Sending...</p>}
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

const getOtherParticipantId = (connection: Connection, currentUserId?: string | null) => {
  if (!currentUserId) return null;
  return connection.user_id === currentUserId ? connection.connected_user_id : connection.user_id;
};

const formatMessageTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export default MessagesPage;
