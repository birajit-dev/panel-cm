'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiBell, FiSettings, FiSend } from 'react-icons/fi';

export default function PushNotifications() {
  const [provider, setProvider] = useState('fcm');
  const [config, setConfig] = useState({
    apiKey: '',
    projectId: '',
    appId: '',
    serverKey: ''
  });
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    topic: 'all'
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotification(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const saveConfiguration = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/push-notifications/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider,
          config
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setSuccess('Configuration saved successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/push-notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...notification,
          provider
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setSuccess('Notification sent successfully');
      setNotification({ title: '', body: '', topic: 'all' });
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Push Notifications</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiSettings className="h-5 w-5" />
              Provider Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fcm">Firebase Cloud Messaging</SelectItem>
                  <SelectItem value="moengage">MoEngage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {provider === 'fcm' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Firebase API Key</Label>
                  <Input
                    id="apiKey"
                    name="apiKey"
                    value={config.apiKey}
                    onChange={handleConfigChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project ID</Label>
                  <Input
                    id="projectId"
                    name="projectId"
                    value={config.projectId}
                    onChange={handleConfigChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appId">App ID</Label>
                  <Input
                    id="appId"
                    name="appId"
                    value={config.appId}
                    onChange={handleConfigChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serverKey">Server Key</Label>
                  <Input
                    id="serverKey"
                    name="serverKey"
                    type="password"
                    value={config.serverKey}
                    onChange={handleConfigChange}
                  />
                </div>
              </>
            )}

            <Button 
              onClick={saveConfiguration}
              disabled={loading}
              className="w-full"
            >
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiBell className="h-5 w-5" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={notification.title}
                onChange={handleNotificationChange}
                placeholder="Notification title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Input
                id="body"
                name="body"
                value={notification.body}
                onChange={handleNotificationChange}
                placeholder="Notification message"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic/Segment</Label>
              <Select 
                value={notification.topic}
                onValueChange={(value) => setNotification(prev => ({ ...prev, topic: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="premium">Premium Users</SelectItem>
                  <SelectItem value="free">Free Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={sendNotification}
              disabled={loading}
              className="w-full gap-2"
            >
              <FiSend className="h-4 w-4" />
              Send Notification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
