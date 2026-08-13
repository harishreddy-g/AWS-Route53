'use client';

import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <label className="block w-full">
      {label ? <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        className={clsx(
          'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-aws-orange focus:ring-2 focus:ring-aws-orange/20',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '',
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
