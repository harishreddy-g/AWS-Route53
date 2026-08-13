'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
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
import { Toast } from '@/components/ui/Toast';
import { getRecordsByZoneId, getZoneById, generateRecordId } from '@/lib/mock-data';
import { formatRecordValue, recordFormToDNSRecord, recordTypeBadgeClass, dnsRecordToForm } from '@/lib/dns-record-utils';
import { DNSRecord, RECORD_TYPES, RecordFormData, RecordType } from '@/types/dns-record';

type ToastState = {
  tone: 'success' | 'error' | 'info';
  title: string;
  message?: string;
} | null;

const ITEMS_PER_PAGE = 8;

export default function HostedZoneDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const zoneId = params.id;

  const zone = getZoneById(zoneId);
  const initialRecords = useMemo(() => getRecordsByZoneId(zoneId), [zoneId]);

  const [records, setRecords] = useState<DNSRecord[]>(initialRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<ToastState>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | null>(null);

  const showToast = (tone: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToast({ tone, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const query = searchTerm.toLowerCase();
      const formattedValue = formatRecordValue(record).toLowerCase();
      const matchesSearch =
        record.name.toLowerCase().includes(query) ||
        record.type.toLowerCase().includes(query) ||
        record.value.toLowerCase().includes(query) ||
        formattedValue.includes(query);
      const matchesType = typeFilter === 'all' || record.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [records, searchTerm, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const isDuplicateRecord = (form: RecordFormData, excludeId?: string) => {
    const candidate = recordFormToDNSRecord(form, zoneId, 'temp');
    return records.some((record) => {
      if (excludeId && record.id === excludeId) {
        return false;
      }

      return (
        record.name === candidate.name &&
        record.type === candidate.type &&
        formatRecordValue(record) === formatRecordValue(candidate)
      );
    });
  };

  const handleCreateSubmit = (form: RecordFormData) => {
    if (isDuplicateRecord(form)) {
      showToast('error', 'Duplicate record', 'A record with the same name, type, and value already exists.');
      return;
    }

    const newRecord = recordFormToDNSRecord(form, zoneId, generateRecordId());
    setRecords((prev) => [...prev, newRecord]);
    setShowCreateModal(false);
    showToast('success', 'Record created', `${newRecord.name} (${newRecord.type}) was added to the hosted zone.`);
  };

  const handleEditOpen = (record: DNSRecord) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleEditSubmit = (form: RecordFormData) => {
    if (!selectedRecord) {
      return;
    }

    if (isDuplicateRecord(form, selectedRecord.id)) {
      showToast('error', 'Duplicate record', 'A record with the same name, type, and value already exists.');
      return;
    }

    const updatedRecord = recordFormToDNSRecord(form, zoneId, selectedRecord.id);
    setRecords((prev) => prev.map((record) => (record.id === selectedRecord.id ? updatedRecord : record)));
    setShowEditModal(false);
    setSelectedRecord(null);
    showToast('success', 'Record updated', `${updatedRecord.name} (${updatedRecord.type}) was updated.`);
  };

  const handleDeleteOpen = (record: DNSRecord) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedRecord) {
      return;
    }

    setRecords((prev) => prev.filter((record) => record.id !== selectedRecord.id));
    setShowDeleteModal(false);
    showToast(
      'success',
      'Record deleted',
      `${selectedRecord.name} (${selectedRecord.type}) was removed from the hosted zone.`,
    );
    setSelectedRecord(null);
  };

  if (!zone) {
    return (
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
              message="The hosted zone you requested does not exist or may have been deleted."
            />
            <Button variant="secondary" onClick={() => router.push('/hosted-zones')}>
              Back to hosted zones
            </Button>
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  const recordTypeOptions = [
    { label: 'All record types', value: 'all' },
    ...RECORD_TYPES.map((type) => ({ label: type, value: type })),
  ];

  return (
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
        description={`${zone.type === 'Public' ? 'Public' : 'Private'} hosted zone · ${records.length} records`}
        actions={
          <Button onClick={() => setShowCreateModal(true)}>Create record</Button>
        }
      >
        <div className="space-y-6">
          <ZoneInfoPanel zone={zone} recordCount={records.length} />

          <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Records</h2>
                <p className="text-sm text-slate-500">
                  Manage DNS record sets for this hosted zone
                </p>
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
                  {filteredRecords.length} of {records.length} records
                </div>
              </div>
            </div>

            {records.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No records in this hosted zone"
                  description="Create your first DNS record to start routing traffic for this domain."
                  action={<Button onClick={() => setShowCreateModal(true)}>Create record</Button>}
                />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No matching records"
                  description={
                    searchTerm
                      ? `No records match "${searchTerm}". Try a different search term or record type.`
                      : 'No records match the selected filter.'
                  }
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => {
                        handleSearch('');
                        handleTypeFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
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
                  data={paginatedRecords}
                  emptyMessage="No records to display"
                />

                {totalPages > 1 && (
                  <div className="flex justify-end border-t border-slate-200 px-5 py-4">
                    <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                )}
              </>
            )}
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
            <Button type="button" variant="danger" onClick={handleDeleteConfirm}>
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
  );
}
