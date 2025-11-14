import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Save } from "lucide-react";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import { AddConnectionDialog } from "@/components/AddConnectionDialog";
import { useConnections } from "@/hooks/useConnections";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Check, X, Trash2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const { connections, isLoading: connectionsLoading, updateConnectionStatus, deleteConnection } = useConnections();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile({
      full_name: fullName,
      phone: phone,
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-warm-accent/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-warm text-white text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-3xl">Profile Settings</CardTitle>
            <CardDescription>Manage your co-parenting account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <Button 
              onClick={handleSave} 
              className="w-full"
              variant="warm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="border-warm-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connected Users</CardTitle>
                <CardDescription>Manage your co-parenting connections</CardDescription>
              </div>
              <AddConnectionDialog />
            </div>
          </CardHeader>
          <CardContent>
            {connectionsLoading ? (
              <p className="text-muted-foreground">Loading connections...</p>
            ) : connections && connections.length > 0 ? (
              <div className="space-y-3">
                {connections.map((connection) => {
                  const isReceiver = connection.connected_user_id === user?.id;
                  const displayUser = connection.connected_user;
                  
                  return (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {displayUser?.full_name?.[0]?.toUpperCase() || displayUser?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {displayUser?.full_name || displayUser?.email || "Unknown User"}
                          </p>
                          <p className="text-sm text-muted-foreground">{displayUser?.email}</p>
                        </div>
                        <Badge variant={
                          connection.status === 'accepted' ? 'default' : 
                          connection.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }>
                          {connection.status}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        {connection.status === 'pending' && isReceiver && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateConnectionStatus({ id: connection.id, status: 'accepted' })}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateConnectionStatus({ id: connection.id, status: 'rejected' })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteConnection(connection.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No connections yet. Add a connection to get started.</p>
            )}
          </CardContent>
        </Card>

        <PushNotificationToggle />
      </main>
    </div>
  );
};

export default Profile;
