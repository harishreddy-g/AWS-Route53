'use client';

import clsx from 'clsx';

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={clsx('flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-8 text-sm text-slate-600', className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-aws-orange" />
      <span>{label}</span>
    </div>
  );
}
