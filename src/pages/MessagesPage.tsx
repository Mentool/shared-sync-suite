import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";

const MessagesPage = () => {
  const [message, setMessage] = useState("");
  
  const messages = [
    { id: 1, sender: "co-parent", text: "Hi, can we discuss the summer schedule?", time: "10:30 AM" },
    { id: 2, sender: "me", text: "Of course! What dates did you have in mind?", time: "10:45 AM" },
    { id: 3, sender: "co-parent", text: "I was thinking the first two weeks of July for my vacation time", time: "11:00 AM" },
    { id: 4, sender: "me", text: "That works for me. I'll plan for the last two weeks of July then.", time: "11:15 AM" },
    { id: 5, sender: "co-parent", text: "Perfect! I'll update the calendar.", time: "11:20 AM" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">Communicate with your co-parent</p>
        </div>
        
        <Card className="flex flex-col h-[calc(100vh-300px)] md:h-[600px]">
          <div className="p-6 border-b border-border bg-gradient-warm text-white">
            <h2 className="font-semibold">Co-Parent</h2>
            <p className="text-sm text-white/80">Active now</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    msg.sender === "me"
                      ? "bg-gradient-warm text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === "me" ? "text-white/70" : "text-muted-foreground"
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 border-t border-border bg-card">
            <div className="flex gap-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    setMessage("");
                  }
                }}
              />
              <Button variant="warm" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default MessagesPage;
