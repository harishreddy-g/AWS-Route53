'use client';

import clsx from 'clsx';

interface ToastProps {
  title: string;
  message?: string;
  tone?: 'success' | 'error' | 'info';
}

const toneClasses = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export function Toast({ title, message, tone = 'info' }: ToastProps) {
  return (
    <div className={clsx('max-w-md rounded-md border px-4 py-3 shadow-soft', toneClasses[tone])}>
      <div className="font-semibold">{title}</div>
      {message ? <div className="mt-1 text-sm">{message}</div> : null}
    </div>
  );
}
