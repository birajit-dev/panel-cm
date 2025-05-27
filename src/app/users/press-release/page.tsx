'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CreatableSelect from 'react-select/creatable';

interface FormData {
  title: string;
  date: string;
  content: string;
  source: string;
  author: string;
  tags: { value: string; label: string; }[];
  link: string;
  thumbnail: File | null;
  thumbnailPreview: string;
  isActive: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PressPage() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    date: '',
    content: '',
    source: '',
    author: '',
    tags: [],
    link: '',
    thumbnail: null,
    thumbnailPreview: '',
    isActive: true
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries({
        ...formData,
        tags: formData.tags.map(tag => tag.value),
      }).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            formDataToSend.append(key, value.toString());
          } else if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, value);
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/press`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Failed to save press release');

      toast.success('Press release created successfully');
      setFormData({
        title: '',
        date: '',
        content: '',
        source: '',
        author: '',
        tags: [],
        link: '',
        thumbnail: null,
        thumbnailPreview: '',
        isActive: true
      });
    } catch (error) {
      toast.error('Failed to save press release');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Press Release</CardTitle>
          <CardDescription>Create and publish your press release content</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Editor
                apiKey='iuydh6tdhtzd5buaia35qxb7gxofaulliy9l2s4b2dybzp65'
                value={formData.content}
                onEditorChange={(content: string) => setFormData(prev => ({ ...prev, content }))}
                init={{
                  height: 500,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <CreatableSelect
                isMulti
                value={formData.tags}
                onChange={(newValue) => 
                  setFormData({ ...formData, tags: newValue as { value: string; label: string; }[] })
                }
                placeholder="Add tags..."
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                {formData.thumbnailPreview && (
                  <div className="w-24 h-24">
                    <img 
                      src={formData.thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
            <Button type="submit">
              Create Press Release
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}