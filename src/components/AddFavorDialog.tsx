import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFavors } from "@/hooks/useFavors";
import { useConnections } from "@/hooks/useConnections";
import { HandHeart } from "lucide-react";

export const AddFavorDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responderId, setResponderId] = useState("");
  const { createFavor } = useFavors();
  const { connections } = useConnections();

  const acceptedConnections = connections?.filter(c => c.status === "accepted") || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !responderId) return;

    createFavor({
      responderId,
      title: title.trim(),
      description: description.trim() || undefined,
    });

    setTitle("");
    setDescription("");
    setResponderId("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <HandHeart className="mr-2 h-4 w-4" />
          Ask for Favor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Favor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="responder">Ask</Label>
            <Select value={responderId} onValueChange={setResponderId} required>
              <SelectTrigger id="responder">
                <SelectValue placeholder="Select a connection" />
              </SelectTrigger>
              <SelectContent>
                {acceptedConnections.map((connection) => (
                  <SelectItem 
                    key={connection.id} 
                    value={connection.connected_user_id}
                  >
                    {connection.connected_user?.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">What do you need?</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Pick up groceries"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full">
            Send Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};