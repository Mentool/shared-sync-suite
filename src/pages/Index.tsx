import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, DollarSign, Heart } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <img src={logo} alt="Pairent Logo" className="h-20 mx-auto mb-8" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Co-Parenting Made Simple
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Communicate, coordinate, and manage shared responsibilities—all in one place.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/auth">
                <Button variant="warm" size="lg" className="gap-2">
                  Get Started
                  <Heart className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need in One App
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed to reduce stress and keep everyone on the same page
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-background shadow-card hover:shadow-soft transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Shared Calendar</h3>
              <p className="text-muted-foreground">
                Never miss pickups, appointments, or important events with a synchronized schedule
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-background shadow-card hover:shadow-soft transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">In-App Messaging</h3>
              <p className="text-muted-foreground">
                Keep all communication documented and organized in one safe space
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-background shadow-card hover:shadow-soft transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Payment Tracking</h3>
              <p className="text-muted-foreground">
                Easily track and exchange payments for all child-related expenses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-warm rounded-2xl p-8 md:p-12 text-white shadow-soft">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Simplify Co-Parenting?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of parents who are making co-parenting easier with Pairent
            </p>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="bg-white text-navy hover:bg-white/90">
                Start Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
