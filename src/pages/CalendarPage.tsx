import Navigation from "@/components/Navigation";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AddEventDialog from "@/components/AddEventDialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useCalendarEvents, useDeleteCalendarEvent } from "@/hooks/useCalendarEvents";
import { format, parseISO } from "date-fns";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: events = [], isLoading } = useCalendarEvents();
  const deleteEvent = useDeleteCalendarEvent();

  const getEventTypeColor = (type: string) => {
    const colors = {
      pickup: "bg-primary/10 text-primary",
      medical: "bg-secondary/10 text-secondary",
      custody: "bg-accent/10 text-accent-foreground",
      school: "bg-blue-100 text-blue-700",
      activity: "bg-green-100 text-green-700",
      other: "bg-muted text-muted-foreground",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-safe-with-nav md:pb-0">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Shared Calendar</h1>
            <p className="text-muted-foreground">Manage custody schedules and important events</p>
          </div>
          <AddEventDialog />
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
              <Accordion type="single" collapsible defaultValue="upcoming-events">
                <AccordionItem value="upcoming-events" className="border-none">
                  <AccordionTrigger className="text-xl font-semibold text-foreground hover:no-underline py-0 mb-4">
                    Upcoming Events
                  </AccordionTrigger>
                  <AccordionContent>
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading events...</div>
                    ) : events.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No events yet. Add your first event to get started!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {events.map((event) => (
                          <div key={event.id} className="p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-border group">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-foreground">{event.title}</h3>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(event.type)}`}>
                                  {event.type}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => deleteEvent.mutate(event.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                            {event.event_time && (
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(`2000-01-01T${event.event_time}`), "h:mm a")}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(parseISO(event.event_date), "MMMM d, yyyy")}
                            </p>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
            
            <Card className="p-6 bg-gradient-warm text-white">
              <h3 className="font-semibold mb-2">Custody Schedule</h3>
              <p className="text-sm text-white/90 mb-4">
                View and manage your custody arrangement schedule
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
