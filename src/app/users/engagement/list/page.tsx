'use client';

import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiDownload, FiCalendar, FiImage, FiTag, FiSearch, FiPlus } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface PhotoEvent {
  _id: string;
  title: string;
  date: string;
  qr_code: string;
  eventType: string;
  images: {
    url: string;
    caption: string;
    _id: string;
  }[];
  permalink: string;
  createdAt: string;
  updatedAt: string;
}

const getEventTypeColor = (eventType: string) => {
  const colors: Record<string, string> = {
    'Wedding': 'bg-pink-100 text-pink-800 border-pink-200',
    'Corporate': 'bg-blue-100 text-blue-800 border-blue-200',
    'Birthday': 'bg-purple-100 text-purple-800 border-purple-200',
    'Anniversary': 'bg-green-100 text-green-800 border-green-200',
    'Other': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[eventType] || colors['Other'];
};

const getEventTypeGradient = (eventType: string) => {
  const gradients: Record<string, string> = {
    'Wedding': 'from-pink-50 to-pink-100',
    'Corporate': 'from-blue-50 to-blue-100',
    'Birthday': 'from-purple-50 to-purple-100',
    'Anniversary': 'from-green-50 to-green-100',
    'Other': 'from-gray-50 to-gray-100'
  };
  return gradients[eventType] || gradients['Other'];
};

export default function EngagementListPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<PhotoEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_BASE_URL}/photos`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.eventType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadQR = async (qrCode: string, title: string) => {
    try {
      const response = await fetch(qrCode);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "QR Code downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR Code",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/users/engagement/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete event');
        
        setEvents(events.filter(event => event._id !== id));
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Photo Events</h1>
        <p className="text-gray-600 mt-2">Manage your photography events and their QR codes</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">All Events</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search events by name or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button 
                onClick={() => router.push('/users/engagement/add')}
                className="gap-2"
              >
                <FiPlus className="h-4 w-4" />
                New Event
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center">
              <p>Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <FiCalendar className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No events found</h3>
              <p className="text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term' : 'Create your first event to get started'}
              </p>
              <Button 
                onClick={() => router.push('/users/engagement/add')}
                className="mt-4"
              >
                Create Event
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredEvents.map((event) => (
                <div 
                  key={event._id}
                  className={`p-4 hover:bg-gradient-to-r ${getEventTypeGradient(event.eventType)} transition-all duration-200`}
                >
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="relative h-28 w-28 flex-shrink-0 rounded-lg overflow-hidden border-2 border-white shadow-md">
                      <Image
                        src={event.qr_code}
                        alt={`QR Code for ${event.title}`}
                        fill
                        className="object-cover bg-white"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border ${getEventTypeColor(event.eventType)}`}>
                              <FiTag className="h-3 w-3" />
                              {event.eventType}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-200">
                              <FiCalendar className="h-3 w-3" />
                              {new Date(event.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-200">
                              <FiImage className="h-3 w-3" />
                              {event.images.length} photos
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadQR(event.qr_code, event.title)}
                            className="hover:bg-white hover:shadow-sm transition-all"
                          >
                            <FiDownload className="h-4 w-4 mr-2" />
                            QR Code
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(event._id)}
                            className="hover:bg-white hover:shadow-sm transition-all"
                          >
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(event._id)}
                            className="hover:shadow-sm transition-all"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}