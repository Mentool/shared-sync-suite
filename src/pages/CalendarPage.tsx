import Navigation from "@/components/Navigation";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const events = [
    { date: "2025-11-01", title: "School pickup", time: "3:00 PM", type: "pickup" },
    { date: "2025-11-03", title: "Doctor appointment", time: "10:00 AM", type: "medical" },
    { date: "2025-11-05", title: "Custody exchange", time: "5:00 PM", type: "custody" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Shared Calendar</h1>
            <p className="text-muted-foreground">Manage custody schedules and important events</p>
          </div>
          <Button variant="warm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </Card>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
              <div className="space-y-3">
                {events.map((event, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{event.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.type === 'pickup' ? 'bg-primary/10 text-primary' :
                        event.type === 'medical' ? 'bg-secondary/10 text-secondary' :
                        'bg-accent/10 text-accent-foreground'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-warm text-white">
              <h3 className="font-semibold mb-2">Custody Schedule</h3>
              <p className="text-sm text-white/90 mb-4">
                Current week: Your custody days are Monday, Tuesday, and Wednesday
              </p>
              <Button variant="outline" className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30">
                View Full Schedule
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
