'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FiMessageSquare, FiSend, FiTrash2 } from 'react-icons/fi';

interface Message {
  _id: string;
  message: string;
  sender: string;
  timestamp: string;
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const userKey = localStorage.getItem('userKey');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages?key=${userKey}`
      );

      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      } else {
        throw new Error(data.message || 'Failed to load messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const userKey = localStorage.getItem('userKey');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/send?key=${userKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMessage })
        }
      );

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const userKey = localStorage.getItem('userKey');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/${messageId}?key=${userKey}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) throw new Error('Failed to delete message');
      
      const data = await response.json();
      if (data.success) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      } else {
        throw new Error(data.message || 'Failed to delete message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <FiMessageSquare className="h-6 w-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Messages
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 mb-6">
            {messages.map((message) => (
              <Card key={message._id} className="relative hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">{message.message}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMessage(message._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" className="gap-2">
              <FiSend className="h-4 w-4" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
