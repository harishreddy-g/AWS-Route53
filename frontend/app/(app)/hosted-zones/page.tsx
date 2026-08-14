'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TableToolbar } from '@/components/hosted-zones/ZoneInfoPanel';
import { useHostedZonesList } from '@/hooks/useHostedZonesList';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage, hostedZones } from '@/lib/api';
import { validateHostedZoneForm } from '@/lib/validation/hosted-zone';
import { HostedZone } from '@/types/hosted-zone';

interface EditFormData {
  name: string;
  description: string;
}

export default function HostedZonesPage() {
  const router = useRouter();
  const { showToast, toastElement } = useToast();

  const {
    zones,
    searchTerm,
    debouncedSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    isLoading,
    isRefreshing,
    error,
    loadZones,
    handleSearch,
    refreshAfterMutation,
  } = useHostedZonesList({ itemsPerPage: 8 });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<HostedZone | null>(null);
  const [asideZone, setAsideZone] = useState<HostedZone | null>(null);
  const [formData, setFormData] = useState<EditFormData>({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string; description?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateOpen = () => router.push('/hosted-zones/create');

  const handleEditOpen = (zone: HostedZone) => {
    setSelectedZone(zone);
    setFormData({ name: zone.name, description: zone.description ?? '' });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedZone) return;

    const validationErrors = validateHostedZoneForm({
      name: formData.name,
      description: formData.description,
    });

    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      await hostedZones.update(selectedZone.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      });
      setShowEditModal(false);
      setSelectedZone(null);
      showToast('success', 'Zone updated', `"${formData.name.trim()}" has been updated successfully`);
      await refreshAfterMutation();
    } catch (saveError) {
      showToast('error', 'Update failed', getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedZone) return;

    setIsSaving(true);
    try {
      await hostedZones.delete(selectedZone.id);
      setShowDeleteModal(false);
      showToast('success', 'Zone deleted', `"${selectedZone.name}" has been deleted successfully`);
      setSelectedZone(null);
      if (asideZone?.id === selectedZone.id) {
        setAsideZone(null);
      }
      await refreshAfterMutation();
    } catch (deleteError) {
      showToast('error', 'Delete failed', getErrorMessage(deleteError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Route 53', href: '/dashboard' },
          { label: 'Hosted zones', active: true },
        ]}
      />

      <PageContainer
        title={`Hosted zones (${total})`}
        actions={
          <>
            <Button variant="secondary" size="sm" disabled>
              View details
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Edit
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Delete
            </Button>
            <Button onClick={handleCreateOpen}>Create hosted zone</Button>
          </>
        }
      >
        {error ? (
          <div className="space-y-3">
            <ErrorState title="Failed to load hosted zones" message={error} />
            <Button variant="secondary" onClick={() => loadZones()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
            <div className="aws-panel min-w-0">
              <TableToolbar
                title="Hosted zones"
                count={total}
                onRefresh={() => loadZones({ silent: true })}
                pagination={
                  totalPages > 1 ? (
                    <Pagination compact page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  ) : null
                }
              />

              <div className="border-b border-aws-border px-4 py-3">
                <Input
                  search
                  placeholder="Filter hosted zones by property or value"
                  value={searchTerm}
                  onChange={(event) => handleSearch(event.target.value)}
                />
              </div>

              {isLoading ? <LoadingState label="Loading hosted zones..." /> : null}

              {!isLoading && total === 0 && !debouncedSearch ? (
                <EmptyState
                  title="No hosted zones yet"
                  description="Create your first hosted zone to start managing DNS records."
                  action={<Button onClick={handleCreateOpen}>Create hosted zone</Button>}
                />
              ) : null}

              {!isLoading && total === 0 && debouncedSearch ? (
                <EmptyState
                  title="No zones found"
                  description={`No hosted zones match "${debouncedSearch}".`}
                  action={
                    <Button variant="secondary" onClick={() => handleSearch('')}>
                      Clear search
                    </Button>
                  }
                />
              ) : null}

              {!isLoading && zones.length > 0 ? (
                <div className={`transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
                  <Table
                    flat
                    getRowKey={(row) => row.id}
                    selectedRowKey={asideZone?.id}
                    onRowClick={(zone) => setAsideZone(zone)}
                    columns={[
                      {
                        key: 'name',
                        header: 'Hosted zone name',
                        render: (_, zone) => (
                          <Link
                            href={`/hosted-zones/${zone.id}`}
                            className="aws-link font-normal"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {zone.name}
                          </Link>
                        ),
                      },
                      {
                        key: 'zoneType',
                        header: 'Type',
                        render: (value) => (
                          <span className="text-aws-sm capitalize">{String(value ?? 'public')}</span>
                        ),
                      },
                      {
                        key: 'description',
                        header: 'Description',
                        render: (value) => <span className="text-aws-muted">{String(value || '—')}</span>,
                      },
                      {
                        key: 'id',
                        header: 'Actions',
                        className: 'text-right',
                        render: (_, zone) => (
                          <div className="flex items-center justify-end gap-3" onClick={(event) => event.stopPropagation()}>
                            <button type="button" onClick={() => handleEditOpen(zone)} className="aws-link text-aws-sm">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedZone(zone);
                                setShowDeleteModal(true);
                              }}
                              className="text-aws-sm text-[#d13212] hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={zones}
                  />
                </div>
              ) : null}
            </div>

            <aside className="hidden border border-l-0 border-aws-border bg-white p-4 lg:block">
              {asideZone ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-aws-text">1 hosted zone selected</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-aws-muted">Name</dt>
                      <dd className="mt-0.5 font-mono text-xs text-aws-text">{asideZone.name}</dd>
                    </div>
                    <div>
                      <dt className="text-aws-muted">Type</dt>
                      <dd className="mt-0.5 capitalize text-aws-text">{asideZone.zoneType}</dd>
                    </div>
                    <div>
                      <dt className="text-aws-muted">Description</dt>
                      <dd className="mt-0.5 text-aws-text">{asideZone.description || '—'}</dd>
                    </div>
                  </dl>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/hosted-zones/${asideZone.id}`)}
                  >
                    View details
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-aws-text">0 hosted zones selected</h3>
                  <p className="mt-8 text-center text-sm text-aws-muted">Select a hosted zone to see its details.</p>
                </>
              )}
            </aside>
          </div>
        )}
      </PageContainer>

      <Modal open={showEditModal} title="Edit hosted zone" onClose={() => setShowEditModal(false)} size="md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Domain name"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            error={formErrors.name}
            info
            autoFocus
          />
          <Textarea
            label="Description - optional"
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            error={formErrors.description}
            info
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="link" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={showDeleteModal} title="Delete hosted zone" onClose={() => setShowDeleteModal(false)} size="sm">
        <div className="space-y-4">
          <div className="border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              Are you sure you want to delete <strong>{selectedZone?.name}</strong>?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="link" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" loading={isSaving} onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {toastElement}
    </>
  );
}
