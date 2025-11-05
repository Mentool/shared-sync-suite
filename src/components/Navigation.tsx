import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, MessageSquare, DollarSign, BookHeart, User, LogOut, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/calendar", icon: Calendar, label: "Calendar" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/payments", icon: DollarSign, label: "Payments" },
    { to: "/memory-journal", icon: BookHeart, label: "Memory" },
    { to: "/ai-assistant", icon: Bot, label: "AI Assistant" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-card sticky top-0 z-50 pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="Pairent Logo" className="h-10" />
            </Link>

            <div className="hidden md:flex space-x-1 items-center">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300",
                      isActive
                        ? "bg-gradient-warm text-white shadow-soft"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="gap-2 ml-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border shadow-card z-50 px-1 pb-safe pb-3 pt-2"
        >
          <div className="grid grid-cols-6 gap-1 min-h-[4rem]">
            {links
              .filter((link) => link.to !== "/")
              .map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all duration-300",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                    <span className="text-[10px] font-medium leading-tight">
                      {link.label === "AI Assistant" ? "AI" : link.label}
                    </span>
                  </Link>
                );
              })}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="md:hidden"
          style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 4.5rem)" }}
        />
    </nav>
  );
};

export default Navigation;
