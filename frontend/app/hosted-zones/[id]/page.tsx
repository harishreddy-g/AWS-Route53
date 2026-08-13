'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ZoneInfoPanel } from '@/components/hosted-zones/ZoneInfoPanel';
import { DNSRecordForm, createEmptyForm } from '@/components/hosted-zones/DNSRecordForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Toast } from '@/components/ui/Toast';
import { useDnsRecordsList } from '@/hooks/useDnsRecordsList';
import { dnsRecords, getErrorMessage, hostedZones } from '@/lib/api';
import { formatRecordValue, dnsRecordToForm, recordTypeBadgeClass } from '@/lib/dns-record-utils';
import { DNSRecord, RECORD_TYPES, RecordFormData, RecordType } from '@/types/dns-record';
import { HostedZone } from '@/types/hosted-zone';

type ToastState = {
  tone: 'success' | 'error' | 'info';
  title: string;
  message?: string;
} | null;

export default function HostedZoneDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const zoneId = Number(params.id);
  const isZoneValid = !Number.isNaN(zoneId);

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [isLoadingZone, setIsLoadingZone] = useState(true);
  const [zoneError, setZoneError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | null>(null);

  const {
    records,
    searchTerm,
    debouncedSearch,
    typeFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    total: totalRecords,
    isLoading: isLoadingRecords,
    isRefreshing,
    error: recordsError,
    loadRecords,
    handleSearch,
    handleTypeFilter,
    clearFilters,
    refreshAfterMutation,
  } = useDnsRecordsList(zoneId, { enabled: isZoneValid && !zoneError && Boolean(zone) });

  const showToast = (tone: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToast({ tone, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const loadZone = useCallback(async () => {
    if (!isZoneValid) {
      setZoneError('Invalid hosted zone ID');
      setIsLoadingZone(false);
      return;
    }

    setIsLoadingZone(true);
    setZoneError('');

    try {
      const response = await hostedZones.get(zoneId);
      setZone(response);
    } catch (error) {
      setZone(null);
      setZoneError(getErrorMessage(error, 'Failed to load hosted zone'));
    } finally {
      setIsLoadingZone(false);
    }
  }, [zoneId, isZoneValid]);

  useEffect(() => {
    loadZone();
  }, [loadZone]);

  const handleCreateSubmit = async (form: RecordFormData) => {
    setIsSaving(true);

    try {
      await dnsRecords.create(zoneId, form);
      setShowCreateModal(false);
      showToast('success', 'Record created', `${form.name.trim()} (${form.type}) was added to the hosted zone.`);
      await refreshAfterMutation();
    } catch (error) {
      showToast('error', 'Create failed', getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditOpen = (record: DNSRecord) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (form: RecordFormData) => {
    if (!selectedRecord) {
      return;
    }

    setIsSaving(true);

    try {
      await dnsRecords.update(zoneId, selectedRecord.id, form);
      setShowEditModal(false);
      setSelectedRecord(null);
      showToast('success', 'Record updated', `${form.name.trim()} (${form.type}) was updated.`);
      await refreshAfterMutation();
    } catch (error) {
      showToast('error', 'Update failed', getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOpen = (record: DNSRecord) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) {
      return;
    }

    setIsSaving(true);

    try {
      await dnsRecords.delete(zoneId, selectedRecord.id);
      setShowDeleteModal(false);
      showToast(
        'success',
        'Record deleted',
        `${selectedRecord.name} (${selectedRecord.type}) was removed from the hosted zone.`,
      );
      setSelectedRecord(null);
      await refreshAfterMutation();
    } catch (error) {
      showToast('error', 'Delete failed', getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isZoneValid) {
    return (
      <AuthGuard>
        <AppShell>
          <PageContainer title="Invalid hosted zone">
            <ErrorState title="Invalid zone ID" message="The hosted zone ID in the URL is not valid." />
          </PageContainer>
        </AppShell>
      </AuthGuard>
    );
  }

  if (isLoadingZone) {
    return (
      <AuthGuard>
        <AppShell>
          <LoadingState label="Loading hosted zone..." />
        </AppShell>
      </AuthGuard>
    );
  }

  if (zoneError || !zone) {
    return (
      <AuthGuard>
        <AppShell>
          <Breadcrumbs
            items={[
              { label: 'Route53', href: '/' },
              { label: 'Hosted zones', href: '/hosted-zones' },
              { label: 'Zone not found', active: true },
            ]}
          />
          <PageContainer title="Hosted zone not found">
            <div className="space-y-4">
              <ErrorState
                title="Zone not found"
                message={zoneError || 'The hosted zone you requested does not exist or may have been deleted.'}
              />
              <Button variant="secondary" onClick={() => router.push('/hosted-zones')}>
                Back to hosted zones
              </Button>
            </div>
          </PageContainer>
        </AppShell>
      </AuthGuard>
    );
  }

  const recordTypeOptions = [
    { label: 'All record types', value: 'all' },
    ...RECORD_TYPES.map((type) => ({ label: type, value: type })),
  ];

  const zoneWithRecordCount: HostedZone = { ...zone, recordCount: totalRecords };

  return (
    <AuthGuard>
      <AppShell>
        <Breadcrumbs
          items={[
            { label: 'Route53', href: '/' },
            { label: 'Hosted zones', href: '/hosted-zones' },
            { label: zone.name, active: true },
          ]}
        />

        <PageContainer
          title={zone.name}
          description={`${totalRecords} record${totalRecords === 1 ? '' : 's'}`}
          actions={<Button onClick={() => setShowCreateModal(true)}>Create record</Button>}
        >
          <div className="space-y-6">
            <ZoneInfoPanel zone={zoneWithRecordCount} recordCount={totalRecords} />

            <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Records</h2>
                  <p className="text-sm text-slate-500">Manage DNS record sets for this hosted zone</p>
                </div>
                <Button size="sm" onClick={() => setShowCreateModal(true)}>
                  Create record
                </Button>
              </div>

              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex-1">
                    <Input
                      placeholder="Filter records by name or value..."
                      value={searchTerm}
                      onChange={(event) => handleSearch(event.target.value)}
                    />
                  </div>
                  <div className="w-full lg:w-56">
                    <Select
                      options={recordTypeOptions}
                      value={typeFilter}
                      onChange={(event) => handleTypeFilter(event.target.value)}
                    />
                  </div>
                  <div className="text-sm text-slate-600 whitespace-nowrap">
                    {isRefreshing ? 'Updating...' : `${totalRecords} record${totalRecords === 1 ? '' : 's'}`}
                  </div>
                </div>
              </div>

              {recordsError ? (
                <div className="space-y-3 p-6">
                  <ErrorState title="Failed to load records" message={recordsError} />
                  <Button variant="secondary" onClick={() => loadRecords()}>
                    Retry
                  </Button>
                </div>
              ) : null}

              {!recordsError && isLoadingRecords ? <LoadingState label="Loading DNS records..." /> : null}

              {!recordsError && !isLoadingRecords && totalRecords === 0 && !debouncedSearch && typeFilter === 'all' ? (
                <div className="p-6">
                  <EmptyState
                    title="No records in this hosted zone"
                    description="Create your first DNS record to start routing traffic for this domain."
                    action={<Button onClick={() => setShowCreateModal(true)}>Create record</Button>}
                  />
                </div>
              ) : null}

              {!recordsError && !isLoadingRecords && totalRecords === 0 && (debouncedSearch || typeFilter !== 'all') ? (
                <div className="p-6">
                  <EmptyState
                    title="No matching records"
                    description="No records match the current search or filter."
                    action={
                      <Button variant="secondary" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    }
                  />
                </div>
              ) : null}

              {!recordsError && !isLoadingRecords && records.length > 0 ? (
                <>
                  <div className={`transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
                    <Table
                      columns={[
                        {
                          key: 'name',
                          header: 'Record name',
                          className: 'font-medium',
                          render: (value) => (
                            <span className="font-mono text-xs text-slate-900">{String(value)}</span>
                          ),
                        },
                        {
                          key: 'type',
                          header: 'Type',
                          render: (value) => (
                            <span
                              className={clsx(
                                'inline-flex rounded px-2 py-0.5 text-xs font-semibold',
                                recordTypeBadgeClass(value as RecordType),
                              )}
                            >
                              {String(value)}
                            </span>
                          ),
                        },
                        {
                          key: 'value',
                          header: 'Value/Route traffic to',
                          render: (_, row) => (
                            <span className="font-mono text-xs text-slate-700 break-all">
                              {formatRecordValue(row as DNSRecord)}
                            </span>
                          ),
                        },
                        {
                          key: 'ttl',
                          header: 'TTL (sec)',
                          className: 'text-center',
                          render: (value) => <span className="text-sm text-slate-700">{String(value)}</span>,
                        },
                        {
                          key: 'id',
                          header: 'Actions',
                          className: 'text-right',
                          render: (_, row) => {
                            const record = row as DNSRecord;
                            return (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditOpen(record)}
                                  className="text-xs font-medium text-aws-orange hover:text-aws-orangeDark transition"
                                >
                                  Edit
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOpen(record)}
                                  className="text-xs font-medium text-red-600 hover:text-red-700 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            );
                          },
                        },
                      ]}
                      data={records}
                      emptyMessage="No records to display"
                    />
                  </div>

                  {totalPages > 1 ? (
                    <div className="flex justify-end border-t border-slate-200 px-5 py-4">
                      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                  ) : null}
                </>
              ) : null}
            </section>
          </div>
        </PageContainer>

        <Modal open={showCreateModal} title="Create record" onClose={() => setShowCreateModal(false)} size="lg">
          <DNSRecordForm
            zoneName={zone.name}
            mode="create"
            initialValues={createEmptyForm(zone.name)}
            onCancel={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
          />
        </Modal>

        <Modal open={showEditModal} title="Edit record" onClose={() => setShowEditModal(false)} size="lg">
          {selectedRecord ? (
            <DNSRecordForm
              zoneName={zone.name}
              mode="edit"
              initialValues={dnsRecordToForm(selectedRecord)}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedRecord(null);
              }}
              onSubmit={handleEditSubmit}
            />
          ) : null}
        </Modal>

        <Modal
          open={showDeleteModal}
          title="Delete record"
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedRecord(null);
          }}
          size="sm"
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Are you sure you want to delete the{' '}
                <strong>
                  {selectedRecord?.type} record for {selectedRecord?.name}
                </strong>
                ? This action cannot be undone.
              </p>
              {selectedRecord ? (
                <p className="mt-2 font-mono text-xs text-red-800 break-all">
                  {formatRecordValue(selectedRecord)}
                </p>
              ) : null}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRecord(null);
                }}
              >
                Cancel
              </Button>
              <Button type="button" variant="danger" loading={isSaving} onClick={handleDeleteConfirm}>
                Delete record
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
