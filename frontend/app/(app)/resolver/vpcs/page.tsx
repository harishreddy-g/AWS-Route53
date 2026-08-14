'use client';

import { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/hooks/useToast';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { vpcs, getErrorMessage, type Vpc } from '@/lib/api';

const AWS_REGIONS = [
  'us-east-1','us-east-2','us-west-1','us-west-2','ap-south-1',
  'ap-northeast-1','ap-southeast-1','ap-southeast-2','eu-west-1',
  'eu-central-1','sa-east-1','ca-central-1',
].map((r) => ({ label: r, value: r }));

interface FormData { vpcId: string; region: string; cidrBlock: string; description: string; }
const DEFAULT_FORM: FormData = { vpcId: '', region: 'us-east-1', cidrBlock: '', description: '' };

export default function VpcsPage() {
  const { showToast, toastElement } = useToast();
  const fetcher = (p: { page: number; limit: number; search?: string }) => vpcs.list(p);
  const { items, searchTerm, debouncedSearch, currentPage, setCurrentPage, totalPages, total,
    isLoading, isRefreshing, error, loadItems, handleSearch, refreshAfterMutation } =
    usePaginatedList({ fetcher, itemsPerPage: 10 });

  const [selected, setSelected] = useState<Vpc | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await vpcs.create({ vpc_id: form.vpcId.trim(), region: form.region, cidr_block: form.cidrBlock.trim(), description: form.description.trim() || null });
      setShowCreate(false);
      showToast('success', 'VPC added', `"${form.vpcId}" has been added.`);
      await refreshAfterMutation();
    } catch (err) {
      showToast('error', 'Failed to add VPC', getErrorMessage(err));
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await vpcs.delete(selected.id);
      setShowDelete(false);
      showToast('success', 'VPC removed', `"${selected.vpcId}" has been removed.`);
      setSelected(null);
      await refreshAfterMutation();
    } catch (err) {
      showToast('error', 'Failed to remove', getErrorMessage(err));
    } finally { setIsSaving(false); }
  };

  const typed = items as Vpc[];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Route 53', href: '/dashboard' }, { label: 'VPC Resolver', href: '/resolver/vpcs' }, { label: 'VPCs', active: true }]} />
      <PageContainer
        title={`VPCs (${total})`}
        description="VPCs associated with Route 53 Resolver for private DNS resolution."
        actions={
          <>
            <Button variant="secondary" size="sm" disabled={!selected} onClick={() => selected && setShowDelete(true)}>Remove</Button>
            <Button onClick={() => { setForm(DEFAULT_FORM); setShowCreate(true); }}>Add VPC</Button>
          </>
        }
      >
        {error ? (
          <div className="space-y-3"><ErrorState title="Failed to load VPCs" message={error} /><Button variant="secondary" onClick={() => loadItems()}>Retry</Button></div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
            <div className="aws-panel min-w-0">
              <div className="flex items-center justify-between border-b border-aws-border px-4 py-2">
                <span className="text-sm font-bold">VPCs ({total})</span>
                <button type="button" onClick={() => loadItems({ silent: true })} className="rounded p-1 text-aws-muted hover:text-aws-text" title="Refresh">↻</button>
              </div>
              <div className="border-b border-aws-border px-4 py-3">
                <Input search placeholder="Filter by VPC ID or description" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
              </div>
              {isLoading ? <LoadingState label="Loading VPCs..." /> : null}
              {!isLoading && total === 0 && !debouncedSearch ? (
                <EmptyState title="No VPCs added" description="Add a VPC to associate it with Route 53 Resolver for private DNS resolution."
                  action={<Button onClick={() => { setForm(DEFAULT_FORM); setShowCreate(true); }}>Add VPC</Button>} />
              ) : null}
              {!isLoading && total === 0 && debouncedSearch ? (
                <EmptyState title="No results" description={`No VPCs match "${debouncedSearch}".`}
                  action={<Button variant="secondary" onClick={() => handleSearch('')}>Clear search</Button>} />
              ) : null}
              {!isLoading && typed.length > 0 ? (
                <div className={isRefreshing ? 'opacity-60 transition-opacity' : ''}>
                  <Table flat getRowKey={(r) => r.id} selectedRowKey={selected?.id} onRowClick={(r) => setSelected(r)}
                    columns={[
                      { key: 'vpcId', header: 'VPC ID', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
                      { key: 'region', header: 'Region' },
                      { key: 'cidrBlock', header: 'CIDR block', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
                      { key: 'description', header: 'Description', render: (v) => <span className="text-aws-muted">{v ? String(v) : '—'}</span> },
                    ]}
                    data={typed}
                  />
                </div>
              ) : null}
            </div>
            <aside className="hidden border border-l-0 border-aws-border bg-white p-4 lg:block">
              {selected ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-aws-text">1 VPC selected</h3>
                  <dl className="space-y-3 text-sm">
                    {[['VPC ID', selected.vpcId], ['Region', selected.region], ['CIDR block', selected.cidrBlock], ['Description', selected.description || '—']].map(([l, v]) => (
                      <div key={l}><dt className="text-aws-muted">{l}</dt><dd className="mt-0.5 font-mono text-xs text-aws-text">{v}</dd></div>
                    ))}
                  </dl>
                </div>
              ) : (
                <><h3 className="text-sm font-bold text-aws-text">0 VPCs selected</h3>
                  <p className="mt-8 text-center text-sm text-aws-muted">Select a VPC to see its details.</p></>
              )}
            </aside>
          </div>
        )}
      </PageContainer>

      <Modal open={showCreate} title="Add VPC" onClose={() => setShowCreate(false)} size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="VPC ID" placeholder="vpc-0123456789abcdef0" value={form.vpcId} onChange={(e) => setForm({ ...form, vpcId: e.target.value })} required autoFocus />
          <Select label="Region" options={AWS_REGIONS} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <Input label="CIDR block" placeholder="10.0.0.0/16" value={form.cidrBlock} onChange={(e) => setForm({ ...form, cidrBlock: e.target.value })} required />
          <Input label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="link" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving}>Add VPC</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showDelete} title="Remove VPC" onClose={() => setShowDelete(false)} size="sm">
        <div className="space-y-4">
          <div className="border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">Are you sure you want to remove <strong>{selected?.vpcId}</strong>?</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="link" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button type="button" variant="danger" loading={isSaving} onClick={handleDelete}>Remove</Button>
          </div>
        </div>
      </Modal>
      {toastElement}
    </>
  );
}
