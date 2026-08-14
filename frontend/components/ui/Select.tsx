'use client';

import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  info?: boolean;
  options: Array<{ label: string; value: string }>;
}

export function Select({ label, error, info, options, className, ...props }: SelectProps) {
  return (
    <label className="block w-full">
      {label ? (
        <span className="mb-1 block text-sm font-bold text-aws-text">
          {label}
          {info ? <span className="aws-info-link">Info</span> : null}
        </span>
      ) : null}
      <select
        className={clsx(
          'w-full rounded border border-aws-border bg-white px-3 py-1.5 text-aws-sm text-aws-text outline-none transition focus:border-aws-link focus:ring-1 focus:ring-aws-link/30',
          error ? 'border-red-600 focus:border-red-600 focus:ring-red-200' : '',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
