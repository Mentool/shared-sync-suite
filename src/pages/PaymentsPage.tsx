import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import PaymentForm from "@/components/PaymentForm";
import ExportPayments from "@/components/ExportPayments";
import { usePayments } from "@/hooks/usePayments";
import { useMemo } from "react";
import { format } from "date-fns";

const PaymentsPage = () => {
  const { data: payments = [], isLoading } = usePayments();

  const totals = useMemo(() => {
    const sent = payments
      .filter((p) => p.type === "sent")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    const received = payments
      .filter((p) => p.type === "received")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    return {
      sent,
      received,
      balance: received - sent,
    };
  }, [payments]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Payments</h1>
            <p className="text-muted-foreground">Track and manage child-related expenses</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ExportPayments payments={payments} totals={totals} />
            <Button variant="warm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Payment
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-warm text-white">
            <h3 className="text-sm text-white/80 mb-2">Total Sent</h3>
            <p className="text-3xl font-bold mb-1">${totals.sent.toFixed(2)}</p>
            <p className="text-xs text-white/70">All time</p>
          </Card>
          
          <Card className="p-6 bg-card">
            <h3 className="text-sm text-muted-foreground mb-2">Total Received</h3>
            <p className="text-3xl font-bold text-foreground mb-1">${totals.received.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </Card>
          
          <Card className="p-6 bg-card">
            <h3 className="text-sm text-muted-foreground mb-2">Balance</h3>
            <p className={`text-3xl font-bold mb-1 ${totals.balance >= 0 ? 'text-secondary' : 'text-primary'}`}>
              {totals.balance >= 0 ? '+' : ''}${totals.balance.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {totals.balance >= 0 ? 'In your favor' : 'Owed'}
            </p>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Transaction History</h2>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payments yet. Send your first payment to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.type === "sent"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/10 text-secondary"
                      }`}>
                        {payment.type === "sent" ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        payment.type === "sent" ? "text-primary" : "text-secondary"
                      }`}>
                        {payment.type === "sent" ? "-" : "+"}${Number(payment.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{payment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Send Payment</h2>
            <PaymentForm />
            
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
