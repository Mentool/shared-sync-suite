import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendPayment } from "@/hooks/usePayments";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z
    .number()
    .positive({ message: "Amount must be greater than 0" })
    .max(999999.99, { message: "Amount must be less than $1,000,000" }),
  description: z
    .string()
    .trim()
    .min(1, { message: "Description is required" })
    .max(200, { message: "Description must be less than 200 characters" }),
});

const PaymentForm = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; description?: string }>({});
  
  const sendPayment = useSendPayment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Parse and validate input
    const amountNum = parseFloat(amount);
    
    const result = paymentSchema.safeParse({
      amount: amountNum,
      description,
    });

    if (!result.success) {
      const fieldErrors: { amount?: string; description?: string } = {};
      result.error.errors.forEach((error) => {
        if (error.path[0] === "amount") {
          fieldErrors.amount = error.message;
        } else if (error.path[0] === "description") {
          fieldErrors.description = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    sendPayment.mutate(
      { amount: amountNum, description },
      {
        onSuccess: () => {
          setAmount("");
          setDescription("");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1"
          disabled={sendPayment.isPending}
        />
        {errors.amount && (
          <p className="text-sm text-destructive mt-1">{errors.amount}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g., School supplies"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          maxLength={200}
          disabled={sendPayment.isPending}
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        variant="warm" 
        className="w-full"
        disabled={sendPayment.isPending}
      >
        {sendPayment.isPending ? "Sending..." : "Send Payment"}
      </Button>
    </form>
  );
};

export default PaymentForm;
