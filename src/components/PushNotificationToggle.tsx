import { Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PushNotificationToggle = () => {
  const { permission, isSupported, isSubscribed, requestPermission, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <Alert>
        <AlertDescription>
          Push notifications are not supported in this browser.
        </AlertDescription>
      </Alert>
    );
  }

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await requestPermission();
    } else {
      await unsubscribe();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications for important updates and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="push-notifications" className="cursor-pointer">
            Enable push notifications
          </Label>
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={permission === 'denied'}
          />
        </div>
        
        {permission === 'denied' && (
          <Alert variant="destructive">
            <AlertDescription>
              Push notifications are blocked. Please enable them in your browser settings.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
