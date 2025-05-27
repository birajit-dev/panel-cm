'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FiFolder, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Project {
  _id: string;
  project_name: string;
  project_description: string;
  created_at: string;
  status: 'active' | 'completed' | 'on-hold';
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const domainKey = localStorage.getItem('saasAPI');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects?key=${domainKey}`
      );

      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      } else {
        throw new Error(data.message || 'Failed to load projects');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiFolder className="h-6 w-6" />
          Projects
        </h1>
        <Button className="flex items-center gap-2">
          <FiPlus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">
                {project.project_name}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <FiEdit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500">
                  <FiTrash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {project.project_description}
              </p>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
