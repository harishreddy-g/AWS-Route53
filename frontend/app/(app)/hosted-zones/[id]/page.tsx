'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  PageTabs,
  PublicBadge,
  TableToolbar,
  ZoneInfoPanel,
} from '@/components/hosted-zones/ZoneInfoPanel';
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
import { useDnsRecordsList } from '@/hooks/useDnsRecordsList';
import { useHostedZone } from '@/hooks/useHostedZone';
import { useToast } from '@/hooks/useToast';
import { dnsRecords, getErrorMessage, hostedZones } from '@/lib/api';
import { formatRecordValue, dnsRecordToForm } from '@/lib/dns-record-utils';
import { DNSRecord, RECORD_TYPES, RecordFormData } from '@/types/dns-record';
import { HostedZone } from '@/types/hosted-zone';

export default function HostedZoneDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const zoneId = Number(params.id);
  const { showToast, toastElement } = useToast();

  const { zone, isLoading: isLoadingZone, error: zoneError } = useHostedZone(zoneId);
  const isZoneValid = !Number.isNaN(zoneId);

  const [isSaving, setIsSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteZoneModal, setShowDeleteZoneModal] = useState(false);
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
  } = useDnsRecordsList(zoneId, { enabled: isZoneValid && Boolean(zone) && !zoneError });

  const handleEditSubmit = async (form: RecordFormData) => {
    if (!selectedRecord) return;

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

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;

    setIsSaving(true);
    try {
      await dnsRecords.delete(zoneId, selectedRecord.id);
      setShowDeleteModal(false);
      showToast('success', 'Record deleted', `${selectedRecord.name} (${selectedRecord.type}) was removed.`);
      setSelectedRecord(null);
      await refreshAfterMutation();
    } catch (error) {
      showToast('error', 'Delete failed', getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteZoneConfirm = async () => {
    if (!zone) return;

    setIsSaving(true);
    try {
      await hostedZones.delete(zoneId);
      setShowDeleteZoneModal(false);
      showToast('success', 'Zone deleted', `"${zone.name}" has been deleted successfully`);
      router.push('/hosted-zones');
    } catch (error) {
      showToast('error', 'Delete failed', getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isZoneValid) {
    return (
      <PageContainer title="Invalid hosted zone">
        <ErrorState title="Invalid zone ID" message="The hosted zone ID in the URL is not valid." />
      </PageContainer>
    );
  }

  if (isLoadingZone) {
    return <LoadingState label="Loading hosted zone..." />;
  }

  if (zoneError || !zone) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: 'Route 53', href: '/dashboard' },
            { label: 'Hosted zones', href: '/hosted-zones' },
            { label: 'Zone not found', active: true },
          ]}
        />
        <PageContainer title="Hosted zone not found">
          <ErrorState title="Zone not found" message={zoneError || 'The hosted zone does not exist.'} />
          <Button variant="link" className="mt-4" onClick={() => router.push('/hosted-zones')}>
            Back to hosted zones
          </Button>
        </PageContainer>
      </>
    );
  }

  const recordTypeOptions = [
    { label: 'Type', value: 'all' },
    ...RECORD_TYPES.map((type) => ({ label: type, value: type })),
  ];

  const zoneWithRecordCount: HostedZone = { ...zone, recordCount: totalRecords };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Route 53', href: '/dashboard' },
          { label: 'Hosted zones', href: '/hosted-zones' },
          { label: zone.name, active: true },
        ]}
      />

      <PageContainer
        title={zone.name}
        titleExtra={<PublicBadge zoneType={zone.zoneType} />}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteZoneModal(true)}>
              Delete zone
            </Button>
            <Button onClick={() => router.push(`/hosted-zones/${zoneId}/records/create`)}>Create record</Button>
          </>
        }
      >
        <div className="space-y-4">
          <ZoneInfoPanel zone={zoneWithRecordCount} recordCount={totalRecords} />

          <div className="aws-panel overflow-hidden">
            <PageTabs
              tabs={[
                { label: 'Records', count: totalRecords, active: true },
                { label: 'DNSSEC signing' },
                { label: 'Hosted zone tags', count: 0 },
              ]}
            />

            <TableToolbar
              title="Records"
              count={totalRecords}
              onRefresh={() => loadRecords({ silent: true })}
              pagination={
                totalPages > 1 ? (
                  <Pagination compact page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                ) : null
              }
              actions={
                <Button size="sm" onClick={() => router.push(`/hosted-zones/${zoneId}/records/create`)}>
                  Create record
                </Button>
              }
            />

            <div className="flex flex-col gap-3 border-b border-aws-border px-4 py-3 lg:flex-row lg:items-center">
              <div className="flex-1">
                <Input
                  search
                  placeholder="Filter records by property or value"
                  value={searchTerm}
                  onChange={(event) => handleSearch(event.target.value)}
                />
              </div>
              <Select
                className="lg:w-44"
                options={recordTypeOptions}
                value={typeFilter}
                onChange={(event) => handleTypeFilter(event.target.value)}
              />
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
              <EmptyState
                title="No records in this hosted zone"
                description="Create your first DNS record to start routing traffic."
                action={
                  <Button onClick={() => router.push(`/hosted-zones/${zoneId}/records/create`)}>Create record</Button>
                }
              />
            ) : null}

            {!recordsError && !isLoadingRecords && totalRecords === 0 && (debouncedSearch || typeFilter !== 'all') ? (
              <EmptyState
                title="No matching records"
                description="No records match the current search or filter."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : null}

            {!recordsError && !isLoadingRecords && records.length > 0 ? (
              <div className={`transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
                <Table
                  flat
                  getRowKey={(row) => row.id}
                  columns={[
                    {
                      key: 'name',
                      header: 'Record name',
                      render: (value) => <span className="font-mono text-xs">{String(value)}</span>,
                    },
                    { key: 'type', header: 'Type' },
                    {
                      key: 'value',
                      header: 'Value/Route traffic to',
                      render: (_, record) => (
                        <span className="font-mono text-xs break-all">{formatRecordValue(record)}</span>
                      ),
                    },
                    { key: 'ttl', header: 'TTL (seconds)' },
                    {
                      key: 'id',
                      header: 'Actions',
                      className: 'text-right',
                      render: (_, record) => (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowEditModal(true);
                            }}
                            className="aws-link text-aws-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecord(record);
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
                  data={records}
                />
              </div>
            ) : null}
          </div>
        </div>
      </PageContainer>

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
          <div className="border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              Delete <strong>{selectedRecord?.type}</strong> record for <strong>{selectedRecord?.name}</strong>?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="link" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" loading={isSaving} onClick={handleDeleteConfirm}>
              Delete record
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showDeleteZoneModal}
        title="Delete hosted zone"
        onClose={() => setShowDeleteZoneModal(false)}
        size="sm"
      >
        <div className="space-y-4">
          <div className="border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              Are you sure you want to delete <strong>{zone.name}</strong>? This action cannot be undone. All DNS
              records in this zone will also be deleted.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="link" onClick={() => setShowDeleteZoneModal(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" loading={isSaving} onClick={handleDeleteZoneConfirm}>
              Delete zone
            </Button>
          </div>
        </div>
      </Modal>

      {toastElement}
    </>
  );
}
