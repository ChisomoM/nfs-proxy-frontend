/**
 * useProfileForm Hook
 * Manages form state, validation, and dirty tracking for profile updates
 */

import { useState, useCallback } from 'react';
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/lib/api/merchantProfileAPI.types';

/**
 * Form field errors map
 */
export interface FormErrors {
  [key: string]: string;
}

/**
 * useProfileForm for account info updates
 */
export const useProfileForm = (initialData: { firstName: string; lastName: string; mobile?: string }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (formData.mobile && formData.mobile.trim()) {
      // Basic phone validation (Zambia format)
      const phoneRegex = /^(\+260|260|0)[0-9]{9}$/;
      if (!phoneRegex.test(formData.mobile.trim())) {
        newErrors.mobile = 'Please enter a valid Zambian phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  return {
    formData,
    errors,
    isDirty,
    handleChange,
    validate,
    reset,
    setFormData,
  };
};

/**
 * usePasswordForm for password change
 */
export const usePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong'>('weak');

  const evaluatePasswordStrength = useCallback((password: string) => {
    if (!password) {
      setPasswordStrength('weak');
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength < 2) setPasswordStrength('weak');
    else if (strength < 3) setPasswordStrength('fair');
    else if (strength < 4) setPasswordStrength('good');
    else setPasswordStrength('strong');
  }, []);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Evaluate strength for new password
    if (field === 'newPassword') {
      evaluatePasswordStrength(value);
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors, evaluatePasswordStrength]);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setPasswordStrength('weak');
  }, []);

  return {
    formData,
    errors,
    passwordStrength,
    handleChange,
    validate,
    reset,
    setFormData,
  };
};

/**
 * use2FAForm for 2FA verification
 */
export const use2FAForm = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleChange = useCallback((value: string) => {
    // Only allow numbers, max 6 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
    if (error) setError('');
  }, [error]);

  const validate = useCallback((): boolean => {
    if (!otp) {
      setError('OTP is required');
      return false;
    }
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return false;
    }
    return true;
  }, [otp]);

  const reset = useCallback(() => {
    setOtp('');
    setError('');
  }, []);

  return {
    otp,
    error,
    handleChange,
    validate,
    reset,
    setOtp,
  };
};
