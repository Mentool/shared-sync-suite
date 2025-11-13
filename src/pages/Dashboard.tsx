import { useMemo } from "react";
import { format, isAfter } from "date-fns";
import { Calendar, MessageSquare, DollarSign, Users, BookHeart } from "lucide-react";
import Navigation from "@/components/Navigation";
import DashboardCard from "@/components/DashboardCard";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { usePayments } from "@/hooks/usePayments";
import { useMessages } from "@/hooks/useMessages";
import { useChildren } from "@/hooks/useChildren";

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { data: events = [], isLoading: eventsLoading } = useCalendarEvents();
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { messages, isLoading: messagesLoading } = useMessages();
  const { children, isLoading: childrenLoading } = useChildren();

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return events
      .map((event) => {
        const baseDate = new Date(event.event_date);
        if (event.event_time) {
          const [hours, minutes] = event.event_time.split(":").map(Number);
          baseDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        }
        return { ...event, start: baseDate };
      })
      .filter((event) => isAfter(event.start, now))
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 3);
  }, [events]);

  const recentMessages = useMemo(() => {
    return [...messages]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
  }, [messages]);

  const recentPayments = useMemo(() => {
    return payments.slice(0, 3);
  }, [payments]);

  const paymentTotals = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        if (payment.type === "sent") {
          acc.sent += Number(payment.amount);
        } else {
          acc.received += Number(payment.amount);
        }
        acc.balance = acc.received - acc.sent;
        return acc;
      },
      { sent: 0, received: 0, balance: 0 }
    );
  }, [payments]);

  const greetingName =
    (!profileLoading && profile?.full_name) ||
    user?.email?.split("@")[0] ||
    "there";

  const statsLoading = profileLoading || eventsLoading || paymentsLoading || childrenLoading || messagesLoading;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {greetingName}
          </h1>
          <p className="text-muted-foreground">
            Here’s what’s happening across your co-parenting workspace today.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Card className="p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Children</p>
            <p className="text-3xl font-semibold text-foreground mt-2">
              {statsLoading ? "—" : children.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Active profiles you’re caring for</p>
          </Card>
          <Card className="p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Upcoming Events</p>
            <p className="text-3xl font-semibold text-foreground mt-2">
              {statsLoading ? "—" : upcomingEvents.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Next three items on your shared calendar</p>
          </Card>
          <Card className="p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p
              className={`text-3xl font-semibold mt-2 ${
                paymentTotals.balance >= 0 ? "text-secondary" : "text-primary"
              }`}
            >
              {statsLoading ? "—" : `${paymentTotals.balance >= 0 ? "+" : "-"}$${Math.abs(paymentTotals.balance).toFixed(2)}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentTotals.balance >= 0 ? "In your favor" : "Amount owed"}
            </p>
          </Card>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Shared Calendar"
            description="View and manage custody schedules, events, and important dates"
            icon={Calendar}
            to="/calendar"
            gradient
          />
          
          <DashboardCard
            title="Messages"
            description="Communicate with your co-parent in a safe, documented space"
            icon={MessageSquare}
            to="/messages"
          />
          
          <DashboardCard
            title="Payments"
            description="Track and exchange payments for child-related expenses"
            icon={DollarSign}
            to="/payments"
          />
          
          <DashboardCard
            title="Memory Journal"
            description="Capture precious moments and milestones"
            icon={BookHeart}
            to="/memory-journal"
          />
          
          <DashboardCard
            title="Co-Parent Profile"
            description="View contact information and preferences"
            icon={Users}
            to="/profile"
          />
        </section>
        
        <section className="mt-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="p-6 shadow-card border border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
            {eventsLoading ? (
              <p className="text-sm text-muted-foreground">Loading your schedule...</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events yet. Add one to keep everyone aligned.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/60">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{event.type}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(event.start, "EEE, MMM d • h:mm a")}
                      </p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 shadow-card border border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Payments</h2>
            {paymentsLoading ? (
              <p className="text-sm text-muted-foreground">Checking your payment history...</p>
            ) : recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded yet. Log one to get started.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3 rounded-lg bg-muted/40 border border-border/60"
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-foreground">{payment.description}</p>
                      <span
                        className={`text-sm font-semibold ${
                          payment.type === "sent" ? "text-primary" : "text-secondary"
                        }`}
                      >
                        {payment.type === "sent" ? "-" : "+"}${Number(payment.amount).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize mt-1">{payment.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payment.created_at), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 shadow-card border border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Messages</h2>
            {messagesLoading ? (
              <p className="text-sm text-muted-foreground">Syncing your conversation...</p>
            ) : recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent messages yet. Start the conversation from the Messages page.</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div key={message.id} className="p-3 rounded-lg bg-muted/40 border border-border/60">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-foreground text-sm">
                        {message.direction === "sent" ? "You" : "Co-Parent"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <Separator className="my-2 opacity-40" />
                    <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
