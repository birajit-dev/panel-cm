'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUpload, FiEye, FiEyeOff,FiImage, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SliderItem {
  _id: string;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
  imageUrl: string;
  link?: string;
}

export default function SliderManagementPage() {
  const { toast } = useToast();
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSlider, setCurrentSlider] = useState<SliderItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch sliders from API
  useEffect(() => {
    const fetchSliders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/sliders`);
        if (!response.ok) throw new Error('Failed to fetch sliders');
        const data = await response.json();
        setSliders(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch sliders",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSliders();
  }, [toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddDialog = () => {
    setCurrentSlider({
      _id: '',
      title: '',
      subtitle: '',
      order: sliders.length > 0 ? Math.max(...sliders.map(s => s.order)) + 1 : 1,
      isActive: true,
      imageUrl: '',
      link: ''
    });
    setSelectedFile(null);
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (slider: SliderItem) => {
    setCurrentSlider(slider);
    setImagePreview(slider.imageUrl);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSlider) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', currentSlider.title);
      formData.append('subtitle', currentSlider.subtitle);
      formData.append('order', currentSlider.order.toString());
      formData.append('isActive', currentSlider.isActive.toString());
      if (currentSlider.link) formData.append('link', currentSlider.link);
      if (selectedFile) formData.append('image', selectedFile);

      const url = currentSlider._id ? 
        `${API_BASE_URL}/sliders/${currentSlider._id}` :
        `${API_BASE_URL}/sliders`;

      const response = await fetch(url, {
        method: currentSlider._id ? 'PUT' : 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to save slider');

      const data = await response.json();
      
      if (currentSlider._id) {
        setSliders(sliders.map(s => s._id === data.slider._id ? data.slider : s));
        toast({
          title: "Success",
          description: "Slider updated successfully",
        });
      } else {
        setSliders([...sliders, data.slider]);
        toast({
          title: "Success",
          description: "Slider added successfully",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save slider",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sliderToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sliders/${sliderToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete slider');

      setSliders(sliders.filter(s => s._id !== sliderToDelete));
      toast({
        title: "Success",
        description: "Slider deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete slider",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSliderToDelete(null);
    }
  };

  const moveSlider = async (id: string, direction: 'up' | 'down') => {
    const index = sliders.findIndex(s => s._id === id);
    if (index === -1) return;

    const newSliders = [...sliders];
    const newOrder = direction === 'up' ? index - 1 : index + 1;

    if (newOrder >= 0 && newOrder < newSliders.length) {
      const slider1 = newSliders[index];
      const slider2 = newSliders[newOrder];
      
      try {
        const response = await fetch(`${API_BASE_URL}/sliders/${slider1._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ order: slider2.order })
        });

        if (!response.ok) throw new Error('Failed to update order');

        // Swap orders
        [newSliders[index].order, newSliders[newOrder].order] = 
          [newSliders[newOrder].order, newSliders[index].order];
        
        // Sort by order
        newSliders.sort((a, b) => a.order - b.order);
        setSliders(newSliders);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update slider order",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Slider Management</h1>
        <p className="text-gray-600 mt-2">Manage your homepage slider content</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">Slider Items</CardTitle>
            <Button onClick={openAddDialog} className="gap-2">
              <FiPlus className="h-4 w-4" />
              Add New Slider
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && sliders.length === 0 ? (
            <div className="py-12 text-center">
              <p>Loading sliders...</p>
            </div>
          ) : sliders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <FiImage className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No slider items found</h3>
              <p className="text-gray-500 mt-1">Add your first slider to get started</p>
              <Button onClick={openAddDialog} className="mt-4 gap-2">
                <FiPlus className="h-4 w-4" />
                Add Slider
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead className="w-[100px]">Order</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sliders.sort((a, b) => a.order - b.order).map((slider) => (
                  <TableRow key={slider._id}>
                    <TableCell>
                      <div className="relative h-16 w-24 rounded-md overflow-hidden">
                        <Image
                          src={`http://localhost:3002${slider.imageUrl}`}
                          alt={slider.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{slider.title}</TableCell>
                    <TableCell className="text-gray-600">{slider.subtitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSlider(slider._id, 'up')}
                          disabled={slider.order === 1}
                          className="h-6 w-6"
                        >
                          <FiArrowUp className="h-3 w-3" />
                        </Button>
                        <span className="px-2">{slider.order}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSlider(slider._id, 'down')}
                          disabled={slider.order === sliders.length}
                          className="h-6 w-6"
                        >
                          <FiArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {slider.isActive ? (
                          <FiEye className="text-green-500" />
                        ) : (
                          <FiEyeOff className="text-gray-400" />
                        )}
                        <Switch
                          checked={slider.isActive}
                          onCheckedChange={async (checked) => {
                            try {
                              const response = await fetch(`${API_BASE_URL}/sliders/${slider._id}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ isActive: checked })
                              });

                              if (!response.ok) throw new Error('Failed to update status');

                              setSliders(sliders.map(s => 
                                s._id === slider._id ? {...s, isActive: checked} : s
                              ));
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to update slider status",
                                variant: "destructive"
                              });
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(slider)}
                        >
                          <FiEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSliderToDelete(slider._id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentSlider?._id ? 'Edit Slider' : 'Add New Slider'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={currentSlider?.title || ''}
                  onChange={(e) => 
                    setCurrentSlider(currentSlider ? 
                      {...currentSlider, title: e.target.value} : null)
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subtitle" className="text-right">
                  Subtitle
                </Label>
                <Input
                  id="subtitle"
                  value={currentSlider?.subtitle || ''}
                  onChange={(e) => 
                    setCurrentSlider(currentSlider ? 
                      {...currentSlider, subtitle: e.target.value} : null)
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">
                  Link
                </Label>
                <Input
                  id="link"
                  value={currentSlider?.link || ''}
                  onChange={(e) => 
                    setCurrentSlider(currentSlider ? 
                      {...currentSlider, link: e.target.value} : null)
                  }
                  className="col-span-3"
                  placeholder="Optional: Add a link for this slider"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right">
                  Order
                </Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={currentSlider?.order || 1}
                  onChange={(e) => 
                    setCurrentSlider(currentSlider ? 
                      {...currentSlider, order: parseInt(e.target.value)} : null)
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Active
                </Label>
                <Switch
                  id="isActive"
                  checked={currentSlider?.isActive || false}
                  onCheckedChange={(checked) => 
                    setCurrentSlider(currentSlider ? 
                      {...currentSlider, isActive: checked} : null)
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image
                </Label>
                <div className="col-span-3">
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                    required={!currentSlider?._id}
                  />
                  {imagePreview && (
                    <div className="mt-4 relative h-40 w-full rounded-md overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Slider'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>This action cannot be undone. This will permanently delete the slider.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}