'use client';

import clsx from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  info?: boolean;
}

export function Textarea({ label, error, hint, info, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <label className="block w-full" htmlFor={textareaId}>
      {label ? (
        <span className="mb-1 block text-sm font-bold text-aws-text">
          {label}
          {info ? <span className="aws-info-link">Info</span> : null}
        </span>
      ) : null}
      {hint && !error ? <p className="mb-1 text-xs text-aws-muted">{hint}</p> : null}
      <textarea
        id={textareaId}
        className={clsx(
          'w-full rounded border border-aws-border bg-white px-3 py-1.5 text-aws-sm text-aws-text outline-none transition focus:border-aws-link focus:ring-1 focus:ring-aws-link/30',
          error ? 'border-red-600 focus:border-red-600 focus:ring-red-200' : '',
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
