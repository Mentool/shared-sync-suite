import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const PaymentsPage = () => {
  const transactions = [
    { id: 1, type: "sent", amount: 150, description: "School supplies", date: "Oct 28, 2025", status: "completed" },
    { id: 2, type: "received", amount: 200, description: "Medical expenses", date: "Oct 25, 2025", status: "completed" },
    { id: 3, type: "sent", amount: 100, description: "Extracurricular activities", date: "Oct 20, 2025", status: "completed" },
    { id: 4, type: "received", amount: 175, description: "Clothing", date: "Oct 15, 2025", status: "completed" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Payments</h1>
            <p className="text-muted-foreground">Track and manage child-related expenses</p>
          </div>
          <Button variant="warm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Payment
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-warm text-white">
            <h3 className="text-sm text-white/80 mb-2">Total Sent</h3>
            <p className="text-3xl font-bold mb-1">$250.00</p>
            <p className="text-xs text-white/70">This month</p>
          </Card>
          
          <Card className="p-6 bg-card">
            <h3 className="text-sm text-muted-foreground mb-2">Total Received</h3>
            <p className="text-3xl font-bold text-foreground mb-1">$375.00</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </Card>
          
          <Card className="p-6 bg-card">
            <h3 className="text-sm text-muted-foreground mb-2">Balance</h3>
            <p className="text-3xl font-bold text-secondary mb-1">+$125.00</p>
            <p className="text-xs text-muted-foreground">In your favor</p>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Transaction History</h2>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "sent"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}>
                      {transaction.type === "sent" ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === "sent" ? "text-primary" : "text-secondary"
                    }`}>
                      {transaction.type === "sent" ? "-" : "+"}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Send Payment</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="e.g., School supplies" className="mt-1" />
              </div>
              <Button variant="warm" className="w-full">
                Send Payment
              </Button>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                All payments are securely processed and documented for your records.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentsPage;
