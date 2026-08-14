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
import { registeredDomains, getErrorMessage, type RegisteredDomain } from '@/lib/api';

interface FormData {
  domainName: string;
  expiryDate: string;
  registrantName: string;
  registrantEmail: string;
  autoRenew: boolean;
}
const DEFAULT_FORM: FormData = {
  domainName: '',
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  registrantName: '',
  registrantEmail: '',
  autoRenew: true,
};

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>;
}

export default function RegisteredDomainsPage() {
  const { showToast, toastElement } = useToast();
  const fetcher = (p: { page: number; limit: number; search?: string }) => registeredDomains.list(p);
  const { items, searchTerm, debouncedSearch, currentPage, setCurrentPage, totalPages, total,
    isLoading, isRefreshing, error, loadItems, handleSearch, refreshAfterMutation } =
    usePaginatedList({ fetcher, itemsPerPage: 10 });

  const [selected, setSelected] = useState<RegisteredDomain | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await registeredDomains.create({
        domain_name: form.domainName.trim(),
        expiry_date: form.expiryDate,
        auto_renew: form.autoRenew,
        registrant_name: form.registrantName.trim() || null,
        registrant_email: form.registrantEmail.trim() || null,
      });
      setShowCreate(false);
      showToast('success', 'Domain registered', `"${form.domainName}" has been registered.`);
      await refreshAfterMutation();
    } catch (err) {
      showToast('error', 'Registration failed', getErrorMessage(err));
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await registeredDomains.delete(selected.id);
      setShowDelete(false);
      showToast('success', 'Domain deleted', `"${selected.domainName}" has been removed.`);
      setSelected(null);
      await refreshAfterMutation();
    } catch (err) {
      showToast('error', 'Delete failed', getErrorMessage(err));
    } finally { setIsSaving(false); }
  };

  const typed = items as RegisteredDomain[];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Route 53', href: '/dashboard' }, { label: 'Domains', href: '/domains/registered' }, { label: 'Registered domains', active: true }]} />
      <PageContainer
        title={`Registered domains (${total})`}
        actions={
          <>
            <Button variant="secondary" size="sm" disabled={!selected} onClick={() => selected && setShowDelete(true)}>Delete domain</Button>
            <Button onClick={() => { setForm(DEFAULT_FORM); setShowCreate(true); }}>Register domain</Button>
          </>
        }
      >
        {error ? (
          <div className="space-y-3"><ErrorState title="Failed to load domains" message={error} /><Button variant="secondary" onClick={() => loadItems()}>Retry</Button></div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
            <div className="aws-panel min-w-0">
              <div className="flex items-center justify-between border-b border-aws-border px-4 py-2">
                <span className="text-sm font-bold">Registered domains ({total})</span>
                <button type="button" onClick={() => loadItems({ silent: true })} className="rounded p-1 text-aws-muted hover:text-aws-text" title="Refresh">↻</button>
              </div>
              <div className="border-b border-aws-border px-4 py-3">
                <Input search placeholder="Filter by domain name" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
              </div>
              {isLoading ? <LoadingState label="Loading domains..." /> : null}
              {!isLoading && total === 0 && !debouncedSearch ? (
                <EmptyState title="No registered domains" description="Register a domain to manage it with Route 53."
                  action={<Button onClick={() => { setForm(DEFAULT_FORM); setShowCreate(true); }}>Register domain</Button>} />
              ) : null}
              {!isLoading && total === 0 && debouncedSearch ? (
                <EmptyState title="No results" description={`No domains match "${debouncedSearch}".`}
                  action={<Button variant="secondary" onClick={() => handleSearch('')}>Clear search</Button>} />
              ) : null}
              {!isLoading && typed.length > 0 ? (
                <div className={isRefreshing ? 'opacity-60 transition-opacity' : ''}>
                  <Table flat getRowKey={(r) => r.id} selectedRowKey={selected?.id} onRowClick={(r) => setSelected(r)}
                    columns={[
                      { key: 'domainName', header: 'Domain name', render: (v) => <span className="font-mono text-xs font-medium text-aws-link">{String(v)}</span> },
                      { key: 'status', header: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
                      { key: 'autoRenew', header: 'Auto-renew', render: (v) => <span>{v ? '✓ Enabled' : '✗ Disabled'}</span> },
                      { key: 'expiryDate', header: 'Expiry date' },
                    ]}
                    data={typed}
                  />
                </div>
              ) : null}
            </div>
            <aside className="hidden border border-l-0 border-aws-border bg-white p-4 lg:block">
              {selected ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-aws-text">1 domain selected</h3>
                  <dl className="space-y-3 text-sm">
                    {[
                      ['Domain name', selected.domainName],
                      ['Status', selected.status],
                      ['Auto-renew', selected.autoRenew ? 'Enabled' : 'Disabled'],
                      ['Expiry date', selected.expiryDate],
                      ['Registrant name', selected.registrantName || '—'],
                      ['Registrant email', selected.registrantEmail || '—'],
                    ].map(([l, v]) => (
                      <div key={l}><dt className="text-aws-muted">{l}</dt><dd className="mt-0.5 text-aws-text">{v}</dd></div>
                    ))}
                  </dl>
                </div>
              ) : (
                <><h3 className="text-sm font-bold text-aws-text">0 domains selected</h3>
                  <p className="mt-8 text-center text-sm text-aws-muted">Select a domain to see its details.</p></>
              )}
            </aside>
          </div>
        )}
      </PageContainer>

      <Modal open={showCreate} title="Register domain" onClose={() => setShowCreate(false)} size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Domain name" placeholder="example.com" value={form.domainName}
            onChange={(e) => setForm({ ...form, domainName: e.target.value })} required autoFocus />
          <Input label="Expiry date" type="date" value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Registrant name (optional)" value={form.registrantName}
              onChange={(e) => setForm({ ...form, registrantName: e.target.value })} />
            <Input label="Registrant email (optional)" type="email" value={form.registrantEmail}
              onChange={(e) => setForm({ ...form, registrantEmail: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded border-aws-border" checked={form.autoRenew}
              onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })} />
            <span className="font-bold text-aws-text">Enable auto-renew</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="link" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving}>Register domain</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showDelete} title="Delete domain" onClose={() => setShowDelete(false)} size="sm">
        <div className="space-y-4">
          <div className="border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">Are you sure you want to delete <strong>{selected?.domainName}</strong>? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="link" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button type="button" variant="danger" loading={isSaving} onClick={handleDelete}>Delete domain</Button>
          </div>
        </div>
      </Modal>
      {toastElement}
    </>
  );
}
