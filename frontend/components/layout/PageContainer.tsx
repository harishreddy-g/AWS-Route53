'use client';

import clsx from 'clsx';
import { ReactNode } from 'react';

interface PageContainerProps {
  title?: string;
  titleExtra?: ReactNode;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageContainer({ title, titleExtra, description, actions, children, className }: PageContainerProps) {
  return (
    <div className={clsx('space-y-4', className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? (
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="aws-page-title">{title}</h1>
                {titleExtra}
              </div>
            ) : null}
            {description ? <p className="mt-1 text-sm text-aws-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      )}

      {children}
    </div>
  );
}
