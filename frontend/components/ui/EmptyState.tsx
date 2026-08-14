'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border border-aws-border bg-white px-6 py-12 text-center">
      <div className="text-base font-bold text-aws-text">{title}</div>
      {description ? <div className="mt-2 text-sm text-aws-muted">{description}</div> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
