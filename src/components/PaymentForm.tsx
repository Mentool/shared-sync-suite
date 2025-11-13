import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSendPayment } from "@/hooks/usePayments";

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
  type: z.enum(["sent", "received"]),
  status: z.enum(["pending", "completed", "failed"]),
});

interface PaymentFormProps {
  onSuccess?: () => void;
}

const PaymentForm = ({ onSuccess }: PaymentFormProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"sent" | "received">("sent");
  const [status, setStatus] = useState<"pending" | "completed" | "failed">("completed");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sendPayment = useSendPayment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = paymentSchema.safeParse({
      amount: Number(amount),
      description,
      type,
      status,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0].toString()] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    sendPayment.mutate(parsed.data, {
      onSuccess: () => {
        setAmount("");
        setDescription("");
        setType("sent");
        setStatus("completed");
        onSuccess?.();
      },
    });
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
        {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount}</p>}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment-type">Payment Type</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as "sent" | "received")}
            disabled={sendPayment.isPending}
          >
            <SelectTrigger id="payment-type" className="mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sent">Sent (you paid)</SelectItem>
              <SelectItem value="received">Received (you were paid)</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-destructive mt-1">{errors.type}</p>}
        </div>

        <div>
          <Label htmlFor="payment-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as "pending" | "completed" | "failed")}
            disabled={sendPayment.isPending}
          >
            <SelectTrigger id="payment-status" className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-sm text-destructive mt-1">{errors.status}</p>}
        </div>
      </div>

      <Button
        type="submit"
        variant="warm"
        className="w-full"
        disabled={sendPayment.isPending}
      >
        {sendPayment.isPending ? "Saving..." : "Record Payment"}
      </Button>
    </form>
  );
};

export default PaymentForm;
