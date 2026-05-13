import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectList } from './ProjectList';
import { ProjectForm } from './ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageTransition } from '@/components/shared/PageTransition';
import type { Project } from '@/types/project';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleSelectProject = (project: Project, tab: 'overview' | 'participants' | 'settings' = 'overview') => {
    navigate(`/merchant/apps/${project.id}`, {
      state: { initialTab: tab }
    });
  };

  const handleCreateNew = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (project: Project) => {
    setIsFormOpen(false);
    navigate(`/merchant/apps/${project.id}`, {
      state: {
        sandboxKey: project.sandbox_key,
        productionKey: project.production_key,
      }
    });
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedProject(null);
  };

  return (
    <PageTransition>
      <ProjectList
        onSelectProject={handleSelectProject}
        onCreateNew={handleCreateNew}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-full max-w-lg bg-white rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display font-bold text-display-xs text-gray-900 tracking-tight">
              {selectedProject ? 'Edit App' : 'Create New App'}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 pt-5">
            <ProjectForm
              project={selectedProject}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};
