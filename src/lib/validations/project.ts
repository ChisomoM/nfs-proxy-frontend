/**
 * Validation Utilities
 * Input validation and sanitization for projects and API keys
 */

/**
 * Validate project name
 */
export const validateProjectName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'Project name is required';
  }
  if (name.trim().length < 2) {
    return 'Project name must be at least 2 characters';
  }
  if (name.trim().length > 100) {
    return 'Project name must not exceed 100 characters';
  }
  // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return 'Project name can only contain letters, numbers, spaces, hyphens, and underscores';
  }
  return null;
};

/**
 * Validate project description
 */
export const validateProjectDescription = (description: string | undefined): string | null => {
  if (!description) return null;
  if (description.length > 500) {
    return 'Description must not exceed 500 characters';
  }
  return null;
};

/**
 * Validate webhook URL
 */
export const validateWebhookUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return 'Webhook URL must use HTTP or HTTPS';
    }
    return null;
  } catch {
    return 'Webhook URL must be a valid URL';
  }
};

/**
 * Validate API key name
 */
export const validateApiKeyName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'API key name is required';
  }
  if (name.trim().length < 1) {
    return 'API key name cannot be empty';
  }
  if (name.trim().length > 100) {
    return 'API key name must not exceed 100 characters';
  }
  return null;
};

/**
 * Sanitize string input (remove potential XSS vectors)
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

/**
 * Sanitize URL
 */
export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }
    return urlObj.toString();
  } catch {
    return '';
  }
};

/**
 * Validate entire project form
 */
export interface ProjectFormValidation {
  name?: string;
  description?: string;
  webhook_url?: string;
  environment_id?: string;
}

export const validateProjectForm = (formData: {
  name: string;
  description?: string;
  webhook_url?: string;
  environment_id: string;
}): ProjectFormValidation => {
  const errors: ProjectFormValidation = {};

  const nameError = validateProjectName(formData.name);
  if (nameError) errors.name = nameError;

  const descError = validateProjectDescription(formData.description);
  if (descError) errors.description = descError;

  const urlError = validateWebhookUrl(formData.webhook_url);
  if (urlError) errors.webhook_url = urlError;

  if (!formData.environment_id) {
    errors.environment_id = 'Environment is required';
  }

  return errors;
};

/**
 * Check if validation errors exist
 */
export const hasValidationErrors = (errors: ProjectFormValidation): boolean => {
  return Object.values(errors).some((error) => error !== undefined);
};
