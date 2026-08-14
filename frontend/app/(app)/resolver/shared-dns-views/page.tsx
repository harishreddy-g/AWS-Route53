'use client';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';

export default function SharedDnsViewsPage() {
  return (
    <>
      <Breadcrumbs items={[
        { label: 'Route 53', href: '/dashboard' },
        { label: 'Global Resolver', href: '/resolver/global-resolvers' },
        { label: 'Shared DNS views', active: true },
      ]} />
      <PageContainer
        title="Shared DNS views"
        titleExtra={<span className="rounded bg-aws-link/10 px-2 py-0.5 text-xs font-semibold text-aws-link">New</span>}
        description="Share Route 53 private hosted zones across AWS accounts and VPCs."
        actions={<Button disabled>Create shared DNS view</Button>}
      >
        <div className="aws-panel p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded border border-aws-border bg-aws-grayPanel text-xl font-bold text-aws-link">53</div>
          <h2 className="text-base font-bold text-aws-text">No shared DNS views</h2>
          <p className="mt-2 max-w-lg mx-auto text-sm text-aws-muted">
            Shared DNS views let you share your Route 53 private hosted zones across AWS accounts without requiring VPC peering.
            Create a shared DNS view to get started.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button disabled>Create shared DNS view</Button>
            <a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver-dns-firewall.html"
              target="_blank" rel="noreferrer" className="text-sm text-aws-link hover:underline">Learn more ↗</a>
          </div>
        </div>
        <div className="aws-panel">
          <div className="border-b border-aws-border px-4 py-3">
            <h2 className="text-sm font-bold text-aws-text">Shared DNS views</h2>
          </div>
          <div className="px-4 py-10 text-center text-sm text-aws-muted">No shared DNS views to display</div>
        </div>
      </PageContainer>
    </>
  );
}
