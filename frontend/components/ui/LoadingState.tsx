'use client';

import clsx from 'clsx';

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = 'Loading...', className }: LoadingStateProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center gap-3 border border-aws-border bg-white px-4 py-10 text-sm text-aws-muted',
        className,
      )}
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-aws-border border-t-aws-link" />
      <span>{label}</span>
    </div>
  );
}
