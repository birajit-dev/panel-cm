"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoLink: string;
  publishDate: string;
  category: string;
}

export default function VideoList() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img 
                    src={video.thumbnail || '/placeholder-image.jpg'} 
                    alt={video.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="capitalize">{video.category}</span>
                    <span>{new Date(video.publishDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {videos.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No videos found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
