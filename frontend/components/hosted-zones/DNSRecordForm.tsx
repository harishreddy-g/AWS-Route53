'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  DEFAULT_TTL,
  RECORD_TYPE_FIELDS,
  RecordFormFieldDefinition,
  RecordFormFieldKey,
  TTL_OPTIONS,
  createEmptyRecordForm,
  resetFormForType,
} from '@/lib/dns-record-form-config';
import { validateRecordForm } from '@/lib/dns-record-utils';
import { RECORD_TYPES, RecordFormData, RecordType } from '@/types/dns-record';

export type DNSRecordFormMode = 'create' | 'edit';

export interface DNSRecordFormProps {
  zoneName: string;
  mode?: DNSRecordFormMode;
  initialValues?: RecordFormData;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (form: RecordFormData) => void | Promise<void>;
}

function getFieldValue(form: RecordFormData, key: RecordFormFieldKey): string | number | undefined {
  return form[key];
}

function renderFieldControl(
  field: RecordFormFieldDefinition,
  form: RecordFormData,
  error: string | undefined,
  onChange: (key: RecordFormFieldKey, value: string | number) => void,
) {
  const value = getFieldValue(form, field.key);
  const control = field.control ?? 'input';

  if (control === 'textarea') {
    return (
      <Textarea
        key={field.key}
        label={field.label}
        name={field.key}
        placeholder={field.placeholder}
        value={String(value ?? '')}
        onChange={(event) => onChange(field.key, event.target.value)}
        error={error}
        hint={field.hint}
        rows={3}
      />
    );
  }

  if (control === 'select' && field.options) {
    return (
      <Select
        key={field.key}
        label={field.label}
        name={field.key}
        value={String(value ?? field.options[0]?.value ?? '')}
        options={field.options}
        onChange={(event) => onChange(field.key, event.target.value)}
        error={error}
      />
    );
  }

  return (
    <Input
      key={field.key}
      label={field.label}
      name={field.key}
      type={field.inputType ?? 'text'}
      min={field.min}
      placeholder={field.placeholder}
      value={value ?? ''}
      onChange={(event) =>
        onChange(
          field.key,
          field.inputType === 'number' ? Number(event.target.value) : event.target.value,
        )
      }
      error={error}
    />
  );
}

export function DNSRecordForm({
  zoneName,
  mode = 'create',
  initialValues,
  submitLabel,
  onCancel,
  onSubmit,
}: DNSRecordFormProps) {
  const defaultValues = useMemo(
    () => initialValues ?? createEmptyRecordForm(zoneName),
    [initialValues, zoneName],
  );

  const [form, setForm] = useState<RecordFormData>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(initialValues ?? createEmptyRecordForm(zoneName));
    setErrors({});
  }, [initialValues, zoneName]);

  const typeFields = RECORD_TYPE_FIELDS[form.type];

  const updateField = <K extends keyof RecordFormData>(field: K, value: RecordFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const handleTypeChange = (type: RecordType) => {
    setForm((prev) => resetFormForType(prev, type));
    setErrors({});
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateRecordForm(form, zoneName);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolvedSubmitLabel = submitLabel ?? (mode === 'edit' ? 'Save changes' : 'Create records');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Record name"
        name="name"
        placeholder={zoneName}
        value={form.name}
        onChange={(event) => updateField('name', event.target.value)}
        error={errors.name}
        autoFocus={mode === 'create'}
      />
      <p className="-mt-2 text-xs text-slate-500">
        Enter the zone apex ({zoneName}) or a subdomain such as www.{zoneName}
      </p>

      <Select
        label="Record type"
        value={form.type}
        options={RECORD_TYPES.map((type) => ({ label: type, value: type }))}
        onChange={(event) => handleTypeChange(event.target.value as RecordType)}
        disabled={mode === 'edit'}
      />
      {mode === 'edit' ? (
        <p className="-mt-2 text-xs text-slate-500">
          Record type cannot be changed when editing. Delete and recreate to use a different type.
        </p>
      ) : null}

      {typeFields.map((field) =>
        renderFieldControl(field, form, errors[field.key], (key, value) => {
          updateField(key, value as RecordFormData[typeof key]);
        }),
      )}

      <Select
        label="TTL (seconds)"
        value={String(form.ttl || DEFAULT_TTL)}
        options={TTL_OPTIONS}
        onChange={(event) => updateField('ttl', Number(event.target.value))}
        error={errors.ttl}
      />

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {resolvedSubmitLabel}
        </Button>
      </div>
    </form>
  );
}

export { createEmptyRecordForm as createEmptyForm };
