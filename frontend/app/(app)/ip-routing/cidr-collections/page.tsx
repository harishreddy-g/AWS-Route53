'use client';

import { useState } from 'react';
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
import { cidrCollections, getErrorMessage, type CidrCollection } from '@/lib/api';

export default function CidrCollectionsPage() {
  const { showToast, toastElement } = useToast();
  const fetcher = (p: { page: number; limit: number; search?: string }) => cidrCollections.list(p);
  const { items, searchTerm, debouncedSearch, currentPage, setCurrentPage, totalPages, total,
    isLoading, isRefreshing, error, loadItems, handleSearch, refreshAfterMutation } =
    usePaginatedList({ fetcher, itemsPerPage: 10 });

  const [selected, setSelected] = useState<CidrCollection | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await cidrCollections.create({ name: name.trim() });
      setShowCreate(false);
      setName('');
      showToast('success', 'CIDR collection created', `"${name}" has been created.`);
      await refreshAfterMutation();
    } catch (err) {
      showToast('error', 'Failed to create', getErrorMessage(err));
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await cidrCollections.delete(selected.id);
      setShowDelete(false);
      showToast('success', 'CIDR collection deleted', `"${selected.name}" was deleted.`);
      setSelected(null);
      await refreshAfterMutation();
    } catch (err) {
      showToast('error', 'Delete failed', getErrorMessage(err));
    } finally { setIsSaving(false); }
  };

  const typed = items as CidrCollection[];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Route 53', href: '/dashboard' }, { label: 'IP-based routing', href: '/ip-routing/cidr-collections' }, { label: 'CIDR collections', active: true }]} />
      <PageContainer
        title={`CIDR collections (${total})`}
        description="Named collections of IP address ranges used for IP-based routing policies."
        actions={
          <>
            <Button variant="secondary" size="sm" disabled={!selected} onClick={() => selected && setShowDelete(true)}>Delete</Button>
            <Button onClick={() => { setName(''); setShowCreate(true); }}>Create CIDR collection</Button>
          </>
        }
      >
        {error ? (
          <div className="space-y-3"><ErrorState title="Failed to load CIDR collections" message={error} /><Button variant="secondary" onClick={() => loadItems()}>Retry</Button></div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
            <div className="aws-panel min-w-0">
              <div className="flex items-center justify-between border-b border-aws-border px-4 py-2">
                <span className="text-sm font-bold">CIDR collections ({total})</span>
                <button type="button" onClick={() => loadItems({ silent: true })} className="rounded p-1 text-aws-muted hover:text-aws-text" title="Refresh">↻</button>
              </div>
              <div className="border-b border-aws-border px-4 py-3">
                <Input search placeholder="Filter by name" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
              </div>
              {isLoading ? <LoadingState label="Loading CIDR collections..." /> : null}
              {!isLoading && total === 0 && !debouncedSearch ? (
                <EmptyState title="No CIDR collections"
                  description="Create a CIDR collection to group IP address ranges for IP-based routing."
                  action={<Button onClick={() => { setName(''); setShowCreate(true); }}>Create CIDR collection</Button>} />
              ) : null}
              {!isLoading && total === 0 && debouncedSearch ? (
                <EmptyState title="No results" description={`No collections match "${debouncedSearch}".`}
                  action={<Button variant="secondary" onClick={() => handleSearch('')}>Clear search</Button>} />
              ) : null}
              {!isLoading && typed.length > 0 ? (
                <div className={isRefreshing ? 'opacity-60 transition-opacity' : ''}>
                  <Table flat getRowKey={(r) => r.id} selectedRowKey={selected?.id} onRowClick={(r) => setSelected(r)}
                    columns={[
                      { key: 'name', header: 'Name', render: (v) => <span className="font-medium text-aws-link">{String(v)}</span> },
                      { key: 'version', header: 'Version' },
                      { key: 'createdAt', header: 'Created', render: (v) => <span className="text-aws-muted text-xs">{new Date(String(v)).toLocaleDateString()}</span> },
                    ]}
                    data={typed}
                  />
                </div>
              ) : null}
            </div>
            <aside className="hidden border border-l-0 border-aws-border bg-white p-4 lg:block">
              {selected ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-aws-text">1 collection selected</h3>
                  <dl className="space-y-3 text-sm">
                    {[['Name', selected.name], ['Version', String(selected.version)],
                      ['Created', new Date(selected.createdAt).toLocaleDateString()]].map(([l, v]) => (
                      <div key={l}><dt className="text-aws-muted">{l}</dt><dd className="mt-0.5 text-aws-text">{v}</dd></div>
                    ))}
                  </dl>
                </div>
              ) : (
                <><h3 className="text-sm font-bold text-aws-text">0 collections selected</h3>
                  <p className="mt-8 text-center text-sm text-aws-muted">Select a collection to see its details.</p></>
              )}
            </aside>
          </div>
        )}
      </PageContainer>

      <Modal open={showCreate} title="Create CIDR collection" onClose={() => setShowCreate(false)} size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Collection name" placeholder="my-cidr-collection" value={name}
            onChange={(e) => setName(e.target.value)} required autoFocus />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="link" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving}>Create CIDR collection</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showDelete} title="Delete CIDR collection" onClose={() => setShowDelete(false)} size="sm">
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
