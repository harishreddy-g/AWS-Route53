'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="text-lg font-semibold text-slate-700">{title}</div>
      {description ? <div className="mt-2 text-sm text-slate-500">{description}</div> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
