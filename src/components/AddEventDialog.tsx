import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAddCalendarEvent, CalendarEvent } from "@/hooks/useCalendarEvents";
import { z } from "zod";
import { format } from "date-fns";

const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  event_date: z.string().min(1, "Date is required"),
  event_time: z.string().optional(),
  type: z.enum(["pickup", "medical", "custody", "school", "activity", "other"]),
  recurrence_pattern: z.enum(["none", "daily", "weekly", "biweekly", "monthly"]),
  recurrence_end_date: z.string().optional(),
}).refine(
  (data) => {
    if (data.recurrence_pattern !== "none" && !data.recurrence_end_date) {
      return false;
    }
    return true;
  },
  {
    message: "End date is required for recurring events",
    path: ["recurrence_end_date"],
  }
);

const AddEventDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [eventTime, setEventTime] = useState("");
  const [type, setType] = useState<CalendarEvent["type"]>("other");
  const [recurrencePattern, setRecurrencePattern] = useState<CalendarEvent["recurrence_pattern"]>("none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addEvent = useAddCalendarEvent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = eventSchema.safeParse({
      title,
      description: description || undefined,
      event_date: eventDate,
      event_time: eventTime || undefined,
      type,
      recurrence_pattern: recurrencePattern,
      recurrence_end_date: recurrenceEndDate || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0].toString()] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const validatedData = result.data;
    addEvent.mutate(
      {
        title: validatedData.title,
        description: validatedData.description,
        event_date: validatedData.event_date,
        event_time: validatedData.event_time,
        type: validatedData.type,
        recurrence_pattern: validatedData.recurrence_pattern,
        recurrence_end_date: validatedData.recurrence_end_date,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setEventDate(format(new Date(), "yyyy-MM-dd"));
          setEventTime("");
          setType("other");
          setRecurrencePattern("none");
          setRecurrenceEndDate("");
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="warm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Calendar Event</DialogTitle>
          <DialogDescription>
            Create a new event to keep track of important dates and activities.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., School pickup"
              className="mt-1"
              disabled={addEvent.isPending}
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="type">Type *</Label>
            <Select value={type} onValueChange={(value) => setType(value as CalendarEvent["type"])}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="custody">Custody Exchange</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive mt-1">{errors.type}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Date *</Label>
              <Input
                id="event_date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1"
                disabled={addEvent.isPending}
              />
              {errors.event_date && <p className="text-sm text-destructive mt-1">{errors.event_date}</p>}
            </div>

            <div>
              <Label htmlFor="event_time">Time</Label>
              <Input
                id="event_time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="mt-1"
                disabled={addEvent.isPending}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              className="mt-1"
              rows={3}
              maxLength={500}
              disabled={addEvent.isPending}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label htmlFor="recurrence_pattern">Recurrence</Label>
            <Select value={recurrencePattern} onValueChange={(value) => setRecurrencePattern(value as CalendarEvent["recurrence_pattern"])}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select recurrence pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Does not repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Every other week</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            {errors.recurrence_pattern && <p className="text-sm text-destructive mt-1">{errors.recurrence_pattern}</p>}
          </div>

          {recurrencePattern !== "none" && (
            <div>
              <Label htmlFor="recurrence_end_date">Repeat Until</Label>
              <Input
                id="recurrence_end_date"
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                className="mt-1"
                min={eventDate}
                disabled={addEvent.isPending}
              />
              {errors.recurrence_end_date && <p className="text-sm text-destructive mt-1">{errors.recurrence_end_date}</p>}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="warm" className="flex-1" disabled={addEvent.isPending}>
              {addEvent.isPending ? "Adding..." : "Add Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
