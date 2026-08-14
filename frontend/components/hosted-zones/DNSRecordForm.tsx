'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
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
  variant?: 'page' | 'modal';
  onCancel: () => void;
  onSubmit: (form: RecordFormData) => void | Promise<void>;
}

const TTL_SHORTCUTS = [
  { label: '1m', value: 60 },
  { label: '1h', value: 3600 },
  { label: '1d', value: 86400 },
];

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
        hint={field.hint ?? 'Enter multiple values on separate lines.'}
        info
        rows={4}
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
        info
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
        onChange(field.key, field.inputType === 'number' ? Number(event.target.value) : event.target.value)
      }
      error={error}
      info
    />
  );
}

export function DNSRecordForm({
  zoneName,
  mode = 'create',
  initialValues,
  submitLabel,
  variant = 'modal',
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

  const formBody = (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Record name"
          name="name"
          placeholder=""
          suffix={`.${zoneName}`}
          value={form.name === zoneName ? '' : form.name.replace(`.${zoneName}`, '').replace(/\.$/, '')}
          onChange={(event) => {
            const sub = event.target.value.trim();
            updateField('name', sub ? `${sub}.${zoneName}` : zoneName);
          }}
          error={errors.name}
          info
          autoFocus={mode === 'create'}
        />

        <Select
          label="Record type"
          value={form.type}
          options={RECORD_TYPES.map((type) => ({ label: type, value: type }))}
          onChange={(event) => handleTypeChange(event.target.value as RecordType)}
          disabled={mode === 'edit'}
          info
        />
      </div>

      <p className="-mt-2 text-xs text-aws-muted">
        Keep blank to create a record for the root domain ({zoneName}).
      </p>

      {mode === 'edit' ? (
        <p className="text-xs text-aws-muted">
          Record type cannot be changed when editing. Delete and recreate to use a different type.
        </p>
      ) : null}

      {typeFields.map((field) =>
        renderFieldControl(field, form, errors[field.key], (key, value) => {
          updateField(key, value as RecordFormData[typeof key]);
        }),
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Input
            label="TTL (seconds)"
            name="ttl"
            type="number"
            value={form.ttl || DEFAULT_TTL}
            onChange={(event) => updateField('ttl', Number(event.target.value))}
            error={errors.ttl}
            info
          />
          <div className="mt-2 flex gap-2">
            {TTL_SHORTCUTS.map((shortcut) => (
              <button
                key={shortcut.label}
                type="button"
                onClick={() => updateField('ttl', shortcut.value)}
                className={clsx(
                  'rounded border px-2 py-0.5 text-xs',
                  form.ttl === shortcut.value
                    ? 'border-aws-link bg-aws-link/10 text-aws-link'
                    : 'border-aws-border bg-white text-aws-muted hover:bg-aws-grayPanel',
                )}
              >
                {shortcut.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-aws-muted">Recommended values: 60 to 172800 (two days)</p>
        </div>

        <Select
          label="Routing policy"
          value="simple"
          options={[{ label: 'Simple routing', value: 'simple' }]}
          disabled
          info
        />
      </div>
    </div>
  );

  if (variant === 'page') {
    return (
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-4">
        <section className="aws-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-aws-text">
              Quick create record
              <span className="aws-info-link">Info</span>
            </h2>
          </div>
          {formBody}
        </section>

        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {resolvedSubmitLabel}
          </Button>
          <Button type="button" variant="link" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formBody}
      <div className="flex justify-end gap-2 border-t border-aws-borderLight pt-4">
        <Button type="button" variant="link" onClick={onCancel} disabled={isSubmitting}>
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
