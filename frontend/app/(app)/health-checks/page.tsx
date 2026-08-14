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
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/hooks/useToast';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { healthChecks, getErrorMessage, type HealthCheck } from '@/lib/api';

const PROTOCOL_OPTIONS = [
  { label: 'HTTP', value: 'HTTP' },
  { label: 'HTTPS', value: 'HTTPS' },
  { label: 'TCP', value: 'TCP' },
];

const INTERVAL_OPTIONS = [
  { label: 'Standard (30 seconds)', value: '30' },
  { label: 'Fast (10 seconds)', value: '10' },
];

const THRESHOLD_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}));

interface FormData {
  name: string;
  protocol: 'HTTP' | 'HTTPS' | 'TCP';
  domainName: string;
  ipAddress: string;
  port: string;
  resourcePath: string;
  requestInterval: string;
  failureThreshold: string;
}

const DEFAULT_FORM: FormData = {
  name: '',
  protocol: 'HTTPS',
  domainName: '',
  ipAddress: '',
  port: '',
  resourcePath: '/',
  requestInterval: '30',
  failureThreshold: '3',
};

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Healthy: 'bg-green-100 text-green-800',
    Unhealthy: 'bg-red-100 text-red-800',
    Unknown: 'bg-gray-100 text-gray-600',
  };
  const cls = colorMap[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function HealthChecksPage() {
  const { showToast, toastElement } = useToast();
  const fetcher = (params: { page: number; limit: number; search?: string }) =>
    healthChecks.list(params);

  const {
    items: checks,
    searchTerm,
    debouncedSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    isLoading,
    isRefreshing,
    error,
    loadItems,
    handleSearch,
    refreshAfterMutation,
  } = usePaginatedList({ fetcher, itemsPerPage: 10 });

  const [selectedCheck, setSelectedCheck] = useState<HealthCheck | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const openCreate = () => { setForm(DEFAULT_FORM); setShowCreate(true); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await healthChecks.create({
        name: form.name.trim(),
        protocol: form.protocol,
        domain_name: form.domainName.trim() || null,
        ip_address: form.ipAddress.trim() || null,
        port: form.port ? Number(form.port) : null,
        resource_path: form.resourcePath || '/',
        request_interval: Number(form.requestInterval) as 10 | 30,
        failure_threshold: Number(form.failureThreshold),
      });
      setShowCreate(false);
      showToast('success', 'Health check created', `"${form.name}" was created successfully.`);
      await refreshAfterMutation();
    } catch (err) {
      showToast('error', 'Failed to create', getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCheck) return;
    setIsSaving(true);
    try {
      await healthChecks.delete(selectedCheck.id);
      setShowDelete(false);
      showToast('success', 'Health check deleted', `"${selectedCheck.name}" was deleted.`);
      setSelectedCheck(null);
      await refreshAfterMutation();
    } catch (err) {
      showToast('error', 'Failed to delete', getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const typed = checks as HealthCheck[];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Route 53', href: '/dashboard' }, { label: 'Health checks', active: true }]} />

      <PageContainer
        title={`Health checks (${total})`}
        actions={
          <>
            <Button variant="secondary" size="sm" disabled={!selectedCheck}
              onClick={() => { if (selectedCheck) { setShowDelete(true); } }}>
              Delete
            </Button>
            <Button onClick={openCreate}>Create health check</Button>
          </>
        }
      >
        {error ? (
          <div className="space-y-3">
            <ErrorState title="Failed to load health checks" message={error} />
            <Button variant="secondary" onClick={() => loadItems()}>Retry</Button>
          </div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
            <div className="aws-panel min-w-0">
              <div className="flex items-center justify-between border-b border-aws-border px-4 py-2">
                <span className="text-sm font-bold text-aws-text">Health checks ({total})</span>
                <div className="flex items-center gap-2">
                  {totalPages > 1 && (
                    <Pagination compact page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  )}
                  <button type="button" onClick={() => loadItems({ silent: true })}
                    className="rounded p-1 text-aws-muted hover:text-aws-text" title="Refresh">↻</button>
                </div>
              </div>
              <div className="border-b border-aws-border px-4 py-3">
                <Input search placeholder="Filter health checks by name or domain" value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)} />
              </div>
              {isLoading ? <LoadingState label="Loading health checks..." /> : null}
              {!isLoading && total === 0 && !debouncedSearch ? (
                <EmptyState title="No health checks" description="Create a health check to monitor your endpoint availability."
                  action={<Button onClick={openCreate}>Create health check</Button>} />
              ) : null}
              {!isLoading && total === 0 && debouncedSearch ? (
                <EmptyState title="No results" description={`No health checks match "${debouncedSearch}".`}
                  action={<Button variant="secondary" onClick={() => handleSearch('')}>Clear search</Button>} />
              ) : null}
              {!isLoading && typed.length > 0 ? (
                <div className={isRefreshing ? 'opacity-60 transition-opacity' : ''}>
                  <Table
                    flat
                    getRowKey={(r) => r.id}
                    selectedRowKey={selectedCheck?.id}
                    onRowClick={(r) => setSelectedCheck(r)}
                    columns={[
                      { key: 'name', header: 'Name', render: (v) => <span className="font-medium text-aws-text">{String(v)}</span> },
                      { key: 'protocol', header: 'Protocol' },
                      { key: 'domainName', header: 'Domain name', render: (v) => <span className="font-mono text-xs">{v ? String(v) : '—'}</span> },
                      { key: 'requestInterval', header: 'Interval (s)' },
                      { key: 'failureThreshold', header: 'Threshold' },
                      { key: 'status', header: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
                    ]}
                    data={typed}
                  />
                </div>
              ) : null}
            </div>

            <aside className="hidden border border-l-0 border-aws-border bg-white p-4 lg:block">
              {selectedCheck ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-aws-text">1 health check selected</h3>
                  <dl className="space-y-3 text-sm">
                    {[
                      ['Name', selectedCheck.name],
                      ['Protocol', selectedCheck.protocol],
                      ['Domain', selectedCheck.domainName || '—'],
                      ['IP address', selectedCheck.ipAddress || '—'],
                      ['Port', selectedCheck.port ? String(selectedCheck.port) : '—'],
                      ['Path', selectedCheck.resourcePath],
                      ['Interval', `${selectedCheck.requestInterval}s`],
                      ['Threshold', String(selectedCheck.failureThreshold)],
                      ['Status', selectedCheck.status],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <dt className="text-aws-muted">{label}</dt>
                        <dd className="mt-0.5 text-aws-text">{val}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-aws-text">0 health checks selected</h3>
                  <p className="mt-8 text-center text-sm text-aws-muted">Select a health check to see its details.</p>
                </>
              )}
            </aside>
          </div>
        )}
      </PageContainer>

      {/* Create Modal */}
      <Modal open={showCreate} title="Create health check" onClose={() => setShowCreate(false)} size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" placeholder="my-health-check" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
          <Select label="Protocol" options={PROTOCOL_OPTIONS} value={form.protocol}
            onChange={(e) => setForm({ ...form, protocol: e.target.value as 'HTTP' | 'HTTPS' | 'TCP' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Domain name" placeholder="example.com" value={form.domainName}
              onChange={(e) => setForm({ ...form, domainName: e.target.value })} />
            <Input label="IP address (optional)" placeholder="1.2.3.4" value={form.ipAddress}
              onChange={(e) => setForm({ ...form, ipAddress: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Port (optional)" type="number" placeholder="443" value={form.port}
              onChange={(e) => setForm({ ...form, port: e.target.value })} />
            <Input label="Path" placeholder="/" value={form.resourcePath}
              onChange={(e) => setForm({ ...form, resourcePath: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Request interval" options={INTERVAL_OPTIONS} value={form.requestInterval}
              onChange={(e) => setForm({ ...form, requestInterval: e.target.value })} />
            <Select label="Failure threshold" options={THRESHOLD_OPTIONS} value={form.failureThreshold}
              onChange={(e) => setForm({ ...form, failureThreshold: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="link" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving}>Create health check</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={showDelete} title="Delete health check" onClose={() => setShowDelete(false)} size="sm">
        <div className="space-y-4">
          <div className="border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              Are you sure you want to delete <strong>{selectedCheck?.name}</strong>?
            </p>
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
