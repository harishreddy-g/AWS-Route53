'use client';

import clsx from 'clsx';

interface StatusMessageProps {
  type?: 'success' | 'error' | 'info';
  title?: string;
  message?: string;
  className?: string;
}

const typeClasses = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export function StatusMessage({ type = 'info', title, message, className }: StatusMessageProps) {
  return (
    <div className={clsx('rounded-md border px-4 py-3 text-sm', typeClasses[type], className)}>
      {title ? <div className="font-semibold">{title}</div> : null}
      {message ? <div className="mt-1">{message}</div> : null}
    </div>
  );
}
