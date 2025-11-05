import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdatePayment, Payment } from "@/hooks/usePayments";
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

interface EditPaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPaymentDialog = ({ payment, open, onOpenChange }: EditPaymentDialogProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"sent" | "received">("sent");
  const [errors, setErrors] = useState<{ amount?: string; description?: string }>({});
  
  const updatePayment = useUpdatePayment();

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount.toString());
      setDescription(payment.description);
      setType(payment.type);
      setErrors({});
    }
  }, [payment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!payment) return;

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

    updatePayment.mutate(
      { 
        id: payment.id,
        amount: amountNum, 
        description,
        type,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Update the payment details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-amount">Amount</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
              disabled={updatePayment.isPending}
            />
            {errors.amount && (
              <p className="text-sm text-destructive mt-1">{errors.amount}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              placeholder="e.g., School supplies"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              maxLength={200}
              disabled={updatePayment.isPending}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as "sent" | "received")}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={updatePayment.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="warm" 
              className="flex-1"
              disabled={updatePayment.isPending}
            >
              {updatePayment.isPending ? "Updating..." : "Update Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentDialog;
