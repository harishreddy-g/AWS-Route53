'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/hooks/useToast';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { trafficPolicies, getErrorMessage, type TrafficPolicy } from '@/lib/api';

const ROUTING_TYPE_COLORS: Record<string, string> = {
  Simple: 'bg-blue-100 text-blue-800',
  Weighted: 'bg-purple-100 text-purple-800',
  Latency: 'bg-green-100 text-green-800',
  Failover: 'bg-orange-100 text-orange-800',
  Geolocation: 'bg-teal-100 text-teal-800',
  Multivalue: 'bg-indigo-100 text-indigo-800',
  'IP-based': 'bg-pink-100 text-pink-800',
};

function RoutingTypeBadge({ type }: { type: string }) {
  const cls = ROUTING_TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600';
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{type}</span>;
}

export default function TrafficPoliciesPage() {
  const { showToast, toastElement } = useToast();
  const fetcher = (p: { page: number; limit: number; search?: string }) => trafficPolicies.list(p);
  const { items, searchTerm, debouncedSearch, currentPage, setCurrentPage, totalPages, total,
    isLoading, isRefreshing, error, loadItems, handleSearch, refreshAfterMutation } =
    usePaginatedList({ fetcher, itemsPerPage: 10 });

  const [selected, setSelected] = useState<TrafficPolicy | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await trafficPolicies.delete(selected.id);
      setShowDelete(false);
      showToast('success', 'Policy deleted', `"${selected.name}" was deleted.`);
      setSelected(null);
      await refreshAfterMutation();
    } catch (err) {
      showToast('error', 'Delete failed', getErrorMessage(err));
    } finally { setIsSaving(false); }
  };

  const typed = items as TrafficPolicy[];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Route 53', href: '/dashboard' }, { label: 'Traffic flow', href: '/traffic-flow/traffic-policies' }, { label: 'Traffic policies', active: true }]} />
      <PageContainer
        title={`Traffic policies (${total})`}
        description="Manage how Route 53 responds to DNS queries by routing traffic based on weighted, latency, failover, and geolocation policies."
        actions={
          <>
            <Button variant="secondary" size="sm" disabled={!selected} onClick={() => selected && setShowDelete(true)}>Delete</Button>
            <Link href="/traffic-flow/traffic-policies/create"><Button>Create traffic policy</Button></Link>
          </>
        }
      >
        {error ? (
          <div className="space-y-3"><ErrorState title="Failed to load traffic policies" message={error} /><Button variant="secondary" onClick={() => loadItems()}>Retry</Button></div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
            <div className="aws-panel min-w-0">
              <div className="flex items-center justify-between border-b border-aws-border px-4 py-2">
                <span className="text-sm font-bold">Traffic policies ({total})</span>
                <button type="button" onClick={() => loadItems({ silent: true })} className="rounded p-1 text-aws-muted hover:text-aws-text" title="Refresh">↻</button>
              </div>
              <div className="border-b border-aws-border px-4 py-3">
                <Input search placeholder="Filter by policy name" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
              </div>
              {isLoading ? <LoadingState label="Loading traffic policies..." /> : null}
              {!isLoading && total === 0 && !debouncedSearch ? (
                <EmptyState title="No traffic policies"
                  description="Create a traffic policy to control how Route 53 routes traffic to your resources."
                  action={<Link href="/traffic-flow/traffic-policies/create"><Button>Create traffic policy</Button></Link>} />
              ) : null}
              {!isLoading && total === 0 && debouncedSearch ? (
                <EmptyState title="No results" description={`No policies match "${debouncedSearch}".`}
                  action={<Button variant="secondary" onClick={() => handleSearch('')}>Clear search</Button>} />
              ) : null}
              {!isLoading && typed.length > 0 ? (
                <div className={isRefreshing ? 'opacity-60 transition-opacity' : ''}>
                  <Table flat getRowKey={(r) => r.id} selectedRowKey={selected?.id} onRowClick={(r) => setSelected(r)}
                    columns={[
                      { key: 'name', header: 'Policy name', render: (v) => <span className="font-medium text-aws-link">{String(v)}</span> },
                      { key: 'routingType', header: 'Routing type', render: (v) => <RoutingTypeBadge type={String(v)} /> },
                      { key: 'version', header: 'Version' },
                      { key: 'comment', header: 'Comment', render: (v) => <span className="text-aws-muted">{v ? String(v) : '—'}</span> },
                      { key: 'updatedAt', header: 'Last updated', render: (v) => <span className="text-xs text-aws-muted">{new Date(String(v)).toLocaleDateString()}</span> },
                    ]}
                    data={typed}
                  />
                </div>
              ) : null}
            </div>
            <aside className="hidden border border-l-0 border-aws-border bg-white p-4 lg:block">
              {selected ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-aws-text">1 policy selected</h3>
                  <dl className="space-y-3 text-sm">
                    <div><dt className="text-aws-muted">Name</dt><dd className="mt-0.5 text-aws-text font-medium">{selected.name}</dd></div>
                    <div><dt className="text-aws-muted">Routing type</dt><dd className="mt-0.5"><RoutingTypeBadge type={selected.routingType} /></dd></div>
                    <div><dt className="text-aws-muted">Version</dt><dd className="mt-0.5 text-aws-text">{selected.version}</dd></div>
                    <div><dt className="text-aws-muted">Comment</dt><dd className="mt-0.5 text-aws-text">{selected.comment || '—'}</dd></div>
                  </dl>
                  <Link href={`/traffic-flow/traffic-policies/create?edit=${selected.id}`}>
                    <Button variant="secondary" size="sm" className="w-full">Edit policy</Button>
                  </Link>
                </div>
              ) : (
                <><h3 className="text-sm font-bold text-aws-text">0 policies selected</h3>
                  <p className="mt-8 text-center text-sm text-aws-muted">Select a policy to see its details.</p></>
              )}
            </aside>
          </div>
        )}
      </PageContainer>

      <Modal open={showDelete} title="Delete traffic policy" onClose={() => setShowDelete(false)} size="sm">
        <div className="space-y-4">
          <div className="border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">Are you sure you want to delete <strong>{selected?.name}</strong>?</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="link" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button type="button" variant="danger" loading={isSaving} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
      {toastElement}
    </>
  );
}
