import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemoryEntries } from "@/hooks/useMemoryEntries";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

interface AddMemoryDialogProps {
  childId: string;
}

export const AddMemoryDialog = ({ childId }: AddMemoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState<"photo" | "note" | "milestone">("note");
  const [milestoneDate, setMilestoneDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { addEntry, uploadPhoto } = useMemoryEntries();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl: string | undefined;

      if (file && entryType === "photo") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        imageUrl = await uploadPhoto(file, user.id);
      }

      addEntry(
        {
          child_id: childId,
          title,
          content: content || undefined,
          entry_type: entryType,
          image_url: imageUrl,
          milestone_date: milestoneDate || undefined,
        },
        {
          onSuccess: () => {
            setOpen(false);
            setTitle("");
            setContent("");
            setEntryType("note");
            setMilestoneDate("");
            setFile(null);
          },
        }
      );
    } catch (error: any) {
      toast.error("Failed to upload photo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Memory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Memory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="entryType">Type *</Label>
            <Select value={entryType} onValueChange={(value: any) => setEntryType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>

          {entryType === "milestone" && (
            <div>
              <Label htmlFor="milestoneDate">Milestone Date</Label>
              <Input
                id="milestoneDate"
                type="date"
                value={milestoneDate}
                onChange={(e) => setMilestoneDate(e.target.value)}
              />
            </div>
          )}

          {entryType === "photo" && (
            <div>
              <Label htmlFor="photo">Photo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? "Uploading..." : "Add Memory"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
