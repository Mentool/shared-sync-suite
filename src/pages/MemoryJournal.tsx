import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useChildren } from "@/hooks/useChildren";
import { useMemoryEntries } from "@/hooks/useMemoryEntries";
import { AddChildDialog } from "@/components/AddChildDialog";
import { AddMemoryDialog } from "@/components/AddMemoryDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Trash2, Image, FileText, Award } from "lucide-react";
import { format } from "date-fns";

const MemoryJournal = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { children, isLoading: childrenLoading } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const { entries, isLoading: entriesLoading, deleteEntry } = useMemoryEntries(selectedChildId || undefined);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const getEntryIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="w-4 h-4" />;
      case "milestone":
        return <Award className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case "photo":
        return "bg-blue-500/10 text-blue-500";
      case "milestone":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-purple-500/10 text-purple-500";
    }
  };

    return (
      <div className="min-h-[100dvh] bg-background pb-safe-with-nav md:pb-0">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Memory Journal</h1>
              <p className="text-muted-foreground">Capture precious moments and milestones</p>
            </div>
            <AddChildDialog />
          </div>

          {childrenLoading ? (
            <div>Loading children...</div>
          ) : !children || children.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Add a child to start creating memories</p>
                <AddChildDialog />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Select a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedChildId && <AddMemoryDialog childId={selectedChildId} />}
              </div>

              {selectedChildId && (
                <div className="space-y-4">
                  {entriesLoading ? (
                    <div>Loading memories...</div>
                  ) : !entries || entries.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No memories yet. Start adding some!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    entries.map((entry) => (
                      <Card key={entry.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getEntryColor(entry.entry_type)}>
                                  <span className="flex items-center gap-1">
                                    {getEntryIcon(entry.entry_type)}
                                    {entry.entry_type}
                                  </span>
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(entry.created_at), "PPP")}
                                </span>
                              </div>
                              <CardTitle>{entry.title}</CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {entry.image_url && (
                            <img
                              src={entry.image_url}
                              alt={entry.title}
                              className="w-full rounded-lg mb-4 max-h-96 object-cover"
                            />
                          )}
                          {entry.content && (
                            <p className="text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
                          )}
                          {entry.milestone_date && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Milestone Date: {format(new Date(entry.milestone_date), "PPP")}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MemoryJournal;
