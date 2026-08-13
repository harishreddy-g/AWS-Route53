'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { getErrorMessage } from '@/lib/api';

export interface CreateHostedZoneFormData {
  zoneName: string;
  description: string;
}

interface FormErrors {
  zoneName?: string;
  description?: string;
}

type SubmitState = 'idle' | 'loading' | 'error' | 'success';

interface CreateHostedZoneFormProps {
  variant?: 'page' | 'modal';
  onCancel: () => void;
  onCreate: (data: CreateHostedZoneFormData) => Promise<void>;
  onSuccess?: (data: CreateHostedZoneFormData) => void;
}

const DOMAIN_PATTERN = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

function validateForm(data: CreateHostedZoneFormData): FormErrors {
  const errors: FormErrors = {};
  const zoneName = data.zoneName.trim();

  if (!zoneName) {
    errors.zoneName = 'Zone name is required';
  } else if (zoneName.length < 3) {
    errors.zoneName = 'Zone name must be at least 3 characters';
  } else if (!DOMAIN_PATTERN.test(zoneName)) {
    errors.zoneName = 'Enter a valid domain name (e.g., example.com)';
  }

  if (data.description.length > 500) {
    errors.description = 'Description must be 500 characters or less';
  }

  return errors;
}

export function CreateHostedZoneForm({
  variant = 'page',
  onCancel,
  onCreate,
  onSuccess,
}: CreateHostedZoneFormProps) {
  const [formData, setFormData] = useState<CreateHostedZoneFormData>({
    zoneName: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState('');

  const isSubmitting = submitState === 'loading';

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitState('loading');
    setSubmitError('');

    try {
      await onCreate(formData);
      setSubmitState('success');
      onSuccess?.(formData);
    } catch (error) {
      setSubmitState('error');
      setSubmitError(getErrorMessage(error, 'An error occurred while creating the zone.'));
    }
  };

  const handleRetry = () => {
    setSubmitState('idle');
    setSubmitError('');
  };

  if (submitState === 'loading') {
    return <LoadingState label="Creating hosted zone..." />;
  }

  if (submitState === 'error') {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Failed to create zone"
          message={submitError || 'An error occurred while creating the hosted zone. Please try again.'}
        />
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={handleRetry}>
            Try again
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (submitState === 'success') {
    if (variant === 'page') {
      return (
        <StatusMessage
          type="success"
          title="Zone created successfully"
          message={`${formData.zoneName.trim()} has been created.`}
        />
      );
    }

    return null;
  }

  const descriptionHint =
    formData.description.length > 0 ? `${formData.description.length}/500 characters` : undefined;

  return (
    <form onSubmit={handleSubmit} className={variant === 'page' ? 'mx-auto max-w-2xl' : 'space-y-4'}>
      <div
        className={
          variant === 'page'
            ? 'rounded-lg border border-slate-200 bg-white p-6 shadow-soft'
            : 'space-y-4'
        }
      >
        <Input
          label="Zone name"
          name="zoneName"
          type="text"
          placeholder="example.com"
          value={formData.zoneName}
          onChange={handleInputChange}
          error={errors.zoneName}
          required
          disabled={isSubmitting}
          autoFocus
        />

        <Textarea
          label="Description"
          name="description"
          placeholder="Add a description for this zone (optional)"
          value={formData.description}
          onChange={handleInputChange}
          error={errors.description}
          hint={descriptionHint}
          disabled={isSubmitting}
          rows={4}
        />

        <div className={`flex gap-3 ${variant === 'modal' ? 'justify-end pt-2' : 'pt-2'}`}>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            Create
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
