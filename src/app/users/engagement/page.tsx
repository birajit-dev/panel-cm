'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiImage, FiUpload, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ImageUpload {
  url: string;
  caption: string;
  file?: File;
}

interface PhotoEvent {
  title: string;
  eventType: string;
  date: string;
  permalink?: string;
  images: ImageUpload[];
  qr_code?: string;
}

export default function EngagementPage() {
  const { toast } = useToast();
  const [photoEvent, setPhotoEvent] = useState<PhotoEvent>({
    title: '',
    eventType: '',
    date: '',
    images: []
  });
  const [uploadedImages, setUploadedImages] = useState<ImageUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [successData, setSuccessData] = useState<{qr_code: string, photoLink: string} | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      processFiles(files);
    }
  };

  const processFiles = (files: FileList) => {
    const newImages = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      caption: '',
      file: file
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const removeImage = (index: number) => {
    const updatedImages = [...uploadedImages];
    updatedImages.splice(index, 1);
    setUploadedImages(updatedImages);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updatedImages = [...uploadedImages];
    updatedImages[index].caption = caption;
    setUploadedImages(updatedImages);
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessData(null);

    try {
      const formData = new FormData();
      formData.append('title', photoEvent.title);
      formData.append('eventType', photoEvent.eventType);
      formData.append('date', photoEvent.date);
      formData.append('permalink', photoEvent.title.toLowerCase().replace(/\s+/g, '-'));

      // Add all files as 'images' array and captions array
      uploadedImages.forEach((image, index) => {
        if (image.file) {
          formData.append('images', image.file);
          formData.append('captions', image.caption);
        }
      });

      const response = await fetch(`${API_BASE_URL}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create photo event');
      }

      const data = await response.json();
      
      // Set success data with QR code and photo link
      if (data.photo.qr_code) {
        setSuccessData({
          qr_code: data.photo.qr_code,
          photoLink: `https://domain.com/photoGallery/${data.photo.permalink}`
        });
      }

      toast({
        title: "Success!",
        description: "Photo event created successfully",
      });

      setPhotoEvent({
        title: '',
        eventType: '',
        date: '',
        images: []
      });
      setUploadedImages([]);

    } catch (error) {
      console.error('Error creating photo event:', error);
      toast({
        title: "Error",
        description: "Failed to create photo event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Photo Event</CardTitle>
          <CardDescription>Upload and manage your event photos</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              <div className="space-y-12">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={photoEvent.title}
                    onChange={(e) => setPhotoEvent({...photoEvent, title: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select onValueChange={(value) => setPhotoEvent({...photoEvent, eventType: value})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wedding">Wedding</SelectItem>
                    <SelectItem value="Birthday">Birthday</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Event Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={photoEvent.date}
                  onChange={(e) => setPhotoEvent({...photoEvent, date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Upload Images</Label>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <FiUpload className="h-10 w-10 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">Drag & drop images here, or click to browse</p>
                    <p className="text-xs mt-1">Supports JPG, PNG up to 10MB</p>
                  </div>
                  <div className="mt-4">
                    <Label 
                      htmlFor="file-upload" 
                      className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Select Files
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      required={uploadedImages.length === 0}
                    />
                  </div>
                </div>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-4">Selected Images ({uploadedImages.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border">
                          <Image
                            src={image.url}
                            alt={`Upload ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                        <Input
                          placeholder="Add caption"
                          value={image.caption}
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          className="mt-2 text-xs h-8"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Event...' : 'Create Photo Event'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}