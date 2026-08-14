'use client';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';

interface ResolverInfoPageProps {
  title: string;
  breadcrumbLabel: string;
  description: string;
  emptyTitle: string;
  emptyBody: string;
  docsUrl: string;
}

export function ResolverInfoPage({ title, breadcrumbLabel, description, emptyTitle, emptyBody, docsUrl }: ResolverInfoPageProps) {
  return (
    <>
      <Breadcrumbs items={[
        { label: 'Route 53', href: '/dashboard' },
        { label: 'VPC Resolver', href: '/resolver/vpcs' },
        { label: breadcrumbLabel, active: true },
      ]} />
      <PageContainer title={title} description={description} actions={<Button disabled>Create {title.toLowerCase()}</Button>}>
        <div className="aws-panel p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded border border-aws-border bg-aws-grayPanel text-xl font-bold text-aws-link">53</div>
          <h2 className="text-base font-bold text-aws-text">{emptyTitle}</h2>
          <p className="mt-2 max-w-lg mx-auto text-sm text-aws-muted">{emptyBody}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button disabled>Create {title.toLowerCase()}</Button>
            <a href={docsUrl} target="_blank" rel="noreferrer" className="text-sm text-aws-link hover:underline">Learn more ↗</a>
          </div>
        </div>
        <div className="aws-panel">
          <div className="border-b border-aws-border px-4 py-3">
            <h2 className="text-sm font-bold text-aws-text">{title}</h2>
          </div>
          <div className="px-4 py-10 text-center text-sm text-aws-muted">No {title.toLowerCase()} to display</div>
        </div>
      </PageContainer>
    </>
  );
}
