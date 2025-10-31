import Navigation from "@/components/Navigation";
import DashboardCard from "@/components/DashboardCard";
import { Calendar, MessageSquare, DollarSign, Users, BookHeart } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Manage your co-parenting schedule and communication
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {[
                { date: "Tomorrow", event: "School pickup - 3:00 PM" },
                { date: "Friday", event: "Doctor's appointment - 10:00 AM" },
                { date: "Next Week", event: "Parent-teacher conference" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-foreground">{item.event}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Messages</h2>
            <div className="space-y-3">
              {[
                { sender: "Co-Parent", message: "Confirming pickup time for tomorrow", time: "2 hours ago" },
                { sender: "You", message: "Thanks for the update on the appointment", time: "Yesterday" },
                { sender: "Co-Parent", message: "Can we discuss summer schedule?", time: "2 days ago" },
              ].map((item, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-foreground text-sm">{item.sender}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
