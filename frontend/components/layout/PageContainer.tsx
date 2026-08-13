'use client';

import clsx from 'clsx';
import { ReactNode } from 'react';

interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageContainer({ title, description, actions, children, className }: PageContainerProps) {
  return (
    <div className={clsx('space-y-6', className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            {title ? <h1 className="text-2xl font-semibold text-slate-900">{title}</h1> : null}
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
      )}

      {children}
    </div>
  );
}
