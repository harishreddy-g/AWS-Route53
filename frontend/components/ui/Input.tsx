'use client';

import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  info?: boolean;
  search?: boolean;
  suffix?: string;
}

export function Input({ label, error, hint, info, search, suffix, className, ...props }: InputProps) {
  return (
    <div className="block w-full">
      {label ? (
        <label className="mb-1 block text-sm font-bold text-aws-text">
          {label}
          {info ? <span className="aws-info-link">Info</span> : null}
        </label>
      ) : null}
      {hint && !error ? <p className="mb-1 text-xs text-aws-muted">{hint}</p> : null}

      <div className="relative flex items-center">
        {search ? (
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-aws-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ) : null}

        <input
          className={clsx(
            'w-full rounded border border-aws-border bg-white px-3 py-1.5 text-aws-sm text-aws-text outline-none transition focus:border-aws-link focus:ring-1 focus:ring-aws-link/30',
            search ? 'pl-9' : '',
            suffix ? 'rounded-r-none' : '',
            error ? 'border-red-600 focus:border-red-600 focus:ring-red-200' : '',
            className,
          )}
          {...props}
        />

        {suffix ? (
          <span className="flex shrink-0 items-center rounded-r border border-l-0 border-aws-border bg-aws-grayPanel px-3 py-1.5 text-aws-sm text-aws-muted">
            {suffix}
          </span>
        ) : null}
      </div>

      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
