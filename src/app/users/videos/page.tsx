"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VideoForm() {
  const [formData, setFormData] = useState({
    title: "",
    thumbnail: "",
    videoLink: "",
    publishDate: "",
    category: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form after successful submission
        setFormData({
          title: "",
          thumbnail: "",
          videoLink: "",
          publishDate: "",
          category: ""
        });
        alert("Video added successfully!");
      } else {
        throw new Error("Failed to add video");
      }
    } catch (error) {
      console.error("Error adding video:", error);
      alert("Failed to add video. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Video</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter video title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="Enter thumbnail URL"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoLink">Video Link</Label>
              <Input
                id="videoLink"
                name="videoLink"
                value={formData.videoLink}
                onChange={handleChange}
                placeholder="Enter video link"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date</Label>
              <Input
                id="publishDate"
                name="publishDate"
                type="date"
                value={formData.publishDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Add Video
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
