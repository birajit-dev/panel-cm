'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface PressRelease {
  _id: string;
  title: string;
  date: string;
  content: string;
  source: string;
  author: string;
  tags: string[];
  link: string;
  thumbnailUrl: string;
  isActive: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PressReleaseList() {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPressReleases();
  }, []);

  const fetchPressReleases = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/press`);
      if (!response.ok) throw new Error('Failed to fetch press releases');
      const data = await response.json();
      setPressReleases(data);
    } catch (error) {
      toast.error('Failed to load press releases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this press release?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/press/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete press release');

      toast.success('Press release deleted successfully');
      fetchPressReleases(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete press release');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Press Releases</CardTitle>
          <Link href="/users/press-release">
            <Button>Create New</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pressReleases.map((press) => (
                <TableRow key={press._id}>
                  <TableCell>
                    {press.thumbnailUrl ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={press.thumbnailUrl}
                          alt={press.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{press.title}</TableCell>
                  <TableCell>{new Date(press.date).toLocaleDateString()}</TableCell>
                  <TableCell>{press.author}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${press.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {press.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/users/press-release/edit/${press._id}`}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(press._id)}
                      className="hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pressReleases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No press releases found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
