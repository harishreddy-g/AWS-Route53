'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Toast } from '@/components/ui/Toast';
import { useHostedZonesList } from '@/hooks/useHostedZonesList';
import { getErrorMessage, hostedZones } from '@/lib/api';
import { HostedZone } from '@/types/hosted-zone';

type ToastState = {
  tone: 'success' | 'error' | 'info';
  title: string;
  message?: string;
} | null;

interface EditFormData {
  name: string;
  description: string;
}

export default function HostedZonesPage() {
  const router = useRouter();

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

  const [toast, setToast] = useState<ToastState>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<HostedZone | null>(null);
  const [formData, setFormData] = useState<EditFormData>({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (tone: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToast({ tone, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateOpen = () => {
    router.push('/hosted-zones/create');
  };

  const handleEditOpen = (zone: HostedZone) => {
    setSelectedZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description ?? '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedZone || !formData.name.trim()) {
      showToast('error', 'Validation error', 'Zone name is required');
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

  const handleDeleteOpen = (zone: HostedZone) => {
    setSelectedZone(zone);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedZone) {
      return;
    }

    setIsSaving(true);

    try {
      await hostedZones.delete(selectedZone.id);
      setShowDeleteModal(false);
      showToast('success', 'Zone deleted', `"${selectedZone.name}" has been deleted successfully`);
      setSelectedZone(null);
      await refreshAfterMutation();
    } catch (deleteError) {
      showToast('error', 'Delete failed', getErrorMessage(deleteError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <Breadcrumbs
          items={[
            { label: 'Route53', href: '/' },
            { label: 'Hosted zones', active: true },
          ]}
        />

        <PageContainer
          title="Hosted Zones"
          description="Manage your public and private DNS zones"
          actions={<Button onClick={handleCreateOpen}>Create Hosted Zone</Button>}
        >
          {error ? (
            <div className="space-y-3">
              <ErrorState title="Failed to load hosted zones" message={error} />
              <Button variant="secondary" onClick={() => loadZones()}>
                Retry
              </Button>
            </div>
          ) : null}

          {!error ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-white shadow-soft p-4 mb-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="flex-1 md:max-w-md">
                    <Input
                      placeholder="Search zones by domain name..."
                      value={searchTerm}
                      onChange={(event) => handleSearch(event.target.value)}
                      type="text"
                    />
                  </div>

                  <div className="text-sm text-slate-600">
                    {isRefreshing ? 'Updating...' : `${total} zone${total === 1 ? '' : 's'}`}
                  </div>
                </div>
              </div>

              {isLoading ? <LoadingState label="Loading hosted zones..." /> : null}

              {!isLoading && total === 0 && !debouncedSearch ? (
                <EmptyState
                  title="No hosted zones yet"
                  description="Create your first hosted zone to start managing DNS records."
                  action={<Button onClick={handleCreateOpen}>Create Hosted Zone</Button>}
                />
              ) : null}

              {!isLoading && total === 0 && debouncedSearch ? (
                <EmptyState
                  title="No zones found"
                  description={`No hosted zones match "${debouncedSearch}". Try a different search term.`}
                  action={
                    <Button variant="secondary" onClick={() => handleSearch('')}>
                      Clear search
                    </Button>
                  }
                />
              ) : null}

              {!isLoading && zones.length > 0 ? (
                <>
                  <div
                    className={`rounded-lg border border-slate-200 bg-white shadow-soft overflow-hidden transition-opacity ${
                      isRefreshing ? 'opacity-60' : ''
                    }`}
                  >
                    <Table
                      columns={[
                        {
                          key: 'name',
                          header: 'Domain Name',
                          className: 'font-medium',
                          render: (_, row) => {
                            const zone = row as HostedZone;
                            return (
                              <button
                                type="button"
                                onClick={() => router.push(`/hosted-zones/${zone.id}`)}
                                className="font-medium text-aws-orange hover:text-aws-orangeDark transition text-left"
                              >
                                {zone.name}
                              </button>
                            );
                          },
                        },
                        {
                          key: 'description',
                          header: 'Description',
                          render: (value) => (
                            <span className="text-sm text-slate-600">{String(value || '—')}</span>
                          ),
                        },
                        {
                          key: 'createdAt',
                          header: 'Created',
                          render: (value) => (
                            <span className="text-sm text-slate-600">
                              {new Date(String(value)).toLocaleDateString()}
                            </span>
                          ),
                        },
                        {
                          key: 'id',
                          header: 'Actions',
                          render: (_, row) => (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditOpen(row as HostedZone)}
                                className="text-xs font-medium text-aws-orange hover:text-aws-orangeDark transition"
                              >
                                Edit
                              </button>
                              <span className="text-slate-300">•</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteOpen(row as HostedZone)}
                                className="text-xs font-medium text-red-600 hover:text-red-700 transition"
                              >
                                Delete
                              </button>
                            </div>
                          ),
                          className: 'text-right',
                        },
                      ]}
                      data={zones}
                      emptyMessage="No zones to display"
                    />
                  </div>

                  {totalPages > 1 ? (
                    <div className="mt-4 flex justify-end">
                      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}
        </PageContainer>

        <Modal open={showEditModal} title="Edit Hosted Zone" onClose={() => setShowEditModal(false)} size="md">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Domain Name"
              placeholder="example.com"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              autoFocus
            />

            <Textarea
              label="Description"
              placeholder="Optional description"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          open={showDeleteModal}
          title="Delete Hosted Zone"
          onClose={() => setShowDeleteModal(false)}
          size="sm"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">
                Are you sure you want to delete <strong>{selectedZone?.name}</strong>? This action cannot be undone.
                All DNS records in this zone will be deleted.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" loading={isSaving} onClick={handleDeleteConfirm}>
                Delete Zone
              </Button>
            </div>
          </div>
        </Modal>

        {toast ? (
          <div className="fixed bottom-4 right-4 z-50">
            <Toast title={toast.title} message={toast.message} tone={toast.tone} />
          </div>
        ) : null}
      </AppShell>
    </AuthGuard>
  );
}
