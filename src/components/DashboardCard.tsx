import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  gradient?: boolean;
}

const DashboardCard = ({ title, description, icon: Icon, to, gradient }: DashboardCardProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "group relative overflow-hidden rounded-xl p-6 shadow-card hover:shadow-soft transition-all duration-300 hover:scale-[1.02]",
        gradient ? "bg-gradient-warm text-white" : "bg-card"
      )}
    >
      <div className="relative z-10">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
          gradient ? "bg-white/20" : "bg-gradient-warm"
        )}>
          <Icon className={cn("w-6 h-6", gradient ? "text-white" : "text-white")} />
        </div>
        <h3 className={cn(
          "text-xl font-semibold mb-2",
          gradient ? "text-white" : "text-foreground"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-sm",
          gradient ? "text-white/90" : "text-muted-foreground"
        )}>
          {description}
        </p>
      </div>
      
      {!gradient && (
        <div className="absolute inset-0 bg-gradient-warm opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      )}
    </Link>
  );
};

export default DashboardCard;
