import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProjectService, EnvironmentService } from '@/lib/api/services';
import {
  validateProjectName,
  validateProjectDescription,
} from '@/lib/validations/project';
import { getUserFriendlyErrorMessage } from '@/lib/errors/errorHandler';
import type { Project, Environment, CreateProjectInput } from '@/types/project';

interface ProjectFormProps {
  project?: Project | null;
  onSuccess?: (project: Project) => void;
  onCancel?: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateProjectInput>({
    name: '',
    description: '',
    webhook_url: '',
    app_type: 'integration',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load project data if editing
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        webhook_url: project.webhook_url || '',
        app_type: project.app_type || 'integration',
      });
    }
  }, [project]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateProjectName(formData.name);
    if (nameError) newErrors.name = nameError;

    const descError = validateProjectDescription(formData.description);
    if (descError) newErrors.description = descError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await ProjectService.createProject(formData);
      toast.success('App created successfully');
      onSuccess?.(result);
      setFormData({
        name: '',
        description: '',
        webhook_url: '',
        app_type: 'integration',
      });
      setErrors({});
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof CreateProjectInput,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* App Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="font-sans text-text-sm font-medium text-gray-700">
          App Name <span className="text-danger">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. My Payment App"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={isSubmitting}
          className={cn(
            'font-sans text-text-sm rounded-xl border-gray-200 focus:border-gp-cobalt focus:ring-2 focus:ring-gp-cobalt/20',
            errors.name && 'border-danger focus:border-danger focus:ring-danger/20',
          )}
          autoFocus
        />
        {errors.name && (
          <p className="font-sans text-text-xs text-danger">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="font-sans text-text-sm font-medium text-gray-700">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="What does this app do? (optional)"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className={cn(
            'font-sans text-text-sm rounded-xl border-gray-200 focus:border-gp-cobalt focus:ring-2 focus:ring-gp-cobalt/20 resize-none',
            errors.description && 'border-danger focus:border-danger focus:ring-danger/20',
          )}
        />
        <div className="flex justify-between items-center">
          <p className="font-sans text-text-xs text-gray-400">
            {formData.description.length}/500 characters
          </p>
          {errors.description && (
            <p className="font-sans text-text-xs text-danger">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="bg-danger-light border border-danger/20 text-danger-fg font-sans text-text-sm px-4 py-3 rounded-xl">
          {errors.submit}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="font-sans text-text-sm rounded-xl border-gray-200 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </Button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-gradient shimmer-surface h-10 px-6 rounded-xl text-white font-sans text-text-sm font-semibold inline-flex items-center gap-2 shadow-btn-gradient disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? <><Loader2 size={14} className="animate-spin" />Creating…</>
            : (project ? 'Save Changes' : 'Create App')}
        </button>
      </div>
    </form>
  );
};
