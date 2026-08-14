'use client';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Table } from '@/components/ui/Table';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { registeredDomains, type RegisteredDomain } from '@/lib/api';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Active: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Expired: 'bg-red-100 text-red-800',
    Transferred: 'bg-blue-100 text-blue-800',
  };
  const cls = colorMap[status] ?? 'bg-gray-100 text-gray-600';
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>;
}

export default function DomainRequestsPage() {
  const fetcher = (p: { page: number; limit: number; search?: string }) => registeredDomains.list(p);
  const { items, total, isLoading, error, loadItems } = usePaginatedList({ fetcher, itemsPerPage: 20 });
  const typed = items as RegisteredDomain[];

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Route 53', href: '/dashboard' },
        { label: 'Domains', href: '/domains/registered' },
        { label: 'Requests', active: true },
      ]} />
      <PageContainer title={`Requests (${total})`} description="Domain registration and transfer requests and their current status.">
        {error ? (
          <div className="space-y-3"><ErrorState title="Failed to load requests" message={error} />
            <Button variant="secondary" onClick={() => loadItems()}>Retry</Button></div>
        ) : (
          <div className="aws-panel">
            <div className="flex items-center justify-between border-b border-aws-border px-4 py-2">
              <span className="text-sm font-bold text-aws-text">Requests ({total})</span>
              <button type="button" onClick={() => loadItems({ silent: true })} className="rounded p-1 text-aws-muted hover:text-aws-text" title="Refresh">↻</button>
            </div>
            {isLoading ? <LoadingState label="Loading requests..." /> : null}
            {!isLoading && total === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="text-base font-bold text-aws-text">No requests</div>
                <p className="mt-2 text-sm text-aws-muted">
                  Domain registration requests will appear here.{' '}
                  <Link href="/domains/registered" className="aws-link">Register a domain</Link> to get started.
                </p>
              </div>
            ) : null}
            {!isLoading && typed.length > 0 ? (
              <Table flat
                getRowKey={(r) => r.id}
                columns={[
                  { key: 'domainName', header: 'Domain name', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
                  { key: 'status', header: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
                  { key: 'autoRenew', header: 'Auto-renew', render: (v) => <span className="text-sm">{v ? 'Enabled' : 'Disabled'}</span> },
                  { key: 'expiryDate', header: 'Expiry date' },
                  { key: 'registrantEmail', header: 'Contact email', render: (v) => <span className="text-aws-muted">{v ? String(v) : '—'}</span> },
                  { key: 'createdAt', header: 'Submitted', render: (v) => <span className="text-aws-muted">{new Date(String(v)).toLocaleDateString()}</span> },
                ]}
                data={typed}
              />
            ) : null}
          </div>
        )}
      </PageContainer>
    </>
  );
}
