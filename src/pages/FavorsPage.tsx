import Navigation from "@/components/Navigation";
import { AddFavorDialog } from "@/components/AddFavorDialog";
import { useFavors } from "@/hooks/useFavors";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HandHeart, Check, X, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function FavorsPage() {
  const { favors, isLoading, updateFavorStatus, deleteFavor } = useFavors();
  const { profile } = useProfile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "accepted": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "declined": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-4 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const requestedFavors = favors?.filter(f => f.requester_id === profile?.user_id) || [];
  const receivedFavors = favors?.filter(f => f.responder_id === profile?.user_id) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HandHeart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Favors</h1>
          </div>
          <AddFavorDialog />
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">Requests I've Made</h2>
            {requestedFavors.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  You haven't requested any favors yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {requestedFavors.map((favor) => (
                  <Card key={favor.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle>{favor.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(favor.created_at), "PPp")}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(favor.status)}>
                            {favor.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteFavor(favor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {favor.description && (
                      <CardContent>
                        <p className="text-muted-foreground">{favor.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Requests for Me</h2>
            {receivedFavors.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No one has asked you for a favor yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {receivedFavors.map((favor) => (
                  <Card key={favor.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle>{favor.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(favor.created_at), "PPp")}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(favor.status)}>
                          {favor.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {favor.description && (
                        <p className="text-muted-foreground mb-4">{favor.description}</p>
                      )}
                      {favor.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateFavorStatus({ favorId: favor.id, status: "accepted" })}
                            className="flex-1"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => updateFavorStatus({ favorId: favor.id, status: "declined" })}
                            className="flex-1"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Decline
                          </Button>
                        </div>
                      )}
                      {favor.status === "accepted" && (
                        <Button
                          onClick={() => updateFavorStatus({ favorId: favor.id, status: "completed" })}
                          className="w-full"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Mark as Completed
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}