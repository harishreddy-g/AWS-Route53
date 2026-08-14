'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { getErrorMessage } from '@/lib/api';
import {
  HOSTED_ZONE_DESCRIPTION_MAX,
  validateHostedZoneForm,
} from '@/lib/validation/hosted-zone';

export interface CreateHostedZoneFormData {
  zoneName: string;
  description: string;
  zoneType: 'public' | 'private';
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

export function CreateHostedZoneForm({
  variant = 'page',
  onCancel,
  onCreate,
  onSuccess,
}: CreateHostedZoneFormProps) {
  const [formData, setFormData] = useState<CreateHostedZoneFormData>({
    zoneName: '',
    description: '',
    zoneType: 'public',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState('');

  const isSubmitting = submitState === 'loading';

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const validationErrors = validateHostedZoneForm({
      name: formData.zoneName,
      description: formData.description,
      zoneType: formData.zoneType,
    });

    setErrors({
      zoneName: validationErrors.name,
      description: validationErrors.description,
    });

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
          <Button type="button" variant="link" onClick={onCancel}>
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

  const descriptionHint = `${formData.description.length}/${HOSTED_ZONE_DESCRIPTION_MAX} characters`;

  return (
    <form onSubmit={handleSubmit} className={variant === 'page' ? 'max-w-3xl space-y-4' : 'space-y-4'}>
      <section className="aws-panel p-5">
        <h2 className="mb-4 text-base font-bold text-aws-text">
          Hosted zone configuration
          <span className="aws-info-link">Info</span>
        </h2>

        <div className="space-y-5">
          <Input
            label="Domain name"
            name="zoneName"
            type="text"
            placeholder="example.com"
            value={formData.zoneName}
            onChange={handleInputChange}
            error={errors.zoneName}
            info
            hint="Enter a domain name for which you want Route 53 to be the DNS service."
            required
            disabled={isSubmitting}
            autoFocus
          />

          <Textarea
            label="Description - optional"
            name="description"
            placeholder="The hosted zone is used for..."
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
            info
            disabled={isSubmitting}
            rows={3}
          />
          <p className="-mt-3 text-xs text-aws-muted">{descriptionHint}</p>

          <div>
            <span className="mb-2 block text-sm font-bold text-aws-text">
              Type
              <span className="aws-info-link">Info</span>
            </span>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  value: 'public' as const,
                  title: 'Public hosted zone',
                  description: 'Determines how traffic is routed on the internet.',
                },
                {
                  value: 'private' as const,
                  title: 'Private hosted zone',
                  description: 'Determines how traffic is routed within an Amazon VPC.',
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded border p-4 transition ${
                    formData.zoneType === option.value
                      ? 'border-aws-link ring-1 ring-aws-link/30'
                      : 'border-aws-border hover:border-aws-muted'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="zoneType"
                      value={option.value}
                      checked={formData.zoneType === option.value}
                      onChange={() => setFormData((prev) => ({ ...prev, zoneType: option.value }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-sm font-bold text-aws-text">{option.title}</div>
                      <div className="mt-1 text-xs text-aws-muted">{option.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="aws-panel p-5">
        <h2 className="mb-2 text-base font-bold text-aws-text">Tags</h2>
        <p className="mb-3 text-xs text-aws-muted">Tags are optional key-value pairs you can assign to resources.</p>
        <Button type="button" variant="secondary" size="sm" disabled>
          Add tag
        </Button>
      </section>

      <div className={`flex gap-3 ${variant === 'modal' ? 'justify-end' : ''}`}>
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Create hosted zone
        </Button>
        <Button type="button" variant="link" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
