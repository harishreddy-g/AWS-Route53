'use client';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';

export default function ProfilesPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Route 53', href: '/dashboard' }, { label: 'Profiles', active: true }]} />
      <PageContainer
        title="Profiles"
        description="DNS Firewall rule group associations for your VPCs."
        actions={<Button disabled>Create profile</Button>}
      >
        <div className="aws-panel p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded border border-aws-border bg-aws-grayPanel text-xl font-bold text-aws-link">53</div>
          <h2 className="text-base font-bold text-aws-text">No profiles</h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-aws-muted">
            Route 53 Profiles allow you to apply a set of Route 53 configurations across multiple VPCs and AWS accounts. 
            Associate DNS Firewall rule groups and other configurations with a profile, then share the profile with your VPCs.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button disabled>Create profile</Button>
            <a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/profiles.html"
              target="_blank" rel="noreferrer" className="text-sm text-aws-link hover:underline">
              Learn more ↗
            </a>
          </div>
        </div>

        <div className="aws-panel">
          <div className="border-b border-aws-border px-4 py-3">
            <h2 className="text-sm font-bold text-aws-text">Profiles</h2>
          </div>
          <div className="px-4 py-10 text-center text-sm text-aws-muted">No profiles to display</div>
        </div>
      </PageContainer>
    </>
  );
}
