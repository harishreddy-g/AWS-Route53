'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Toast } from '@/components/ui/Toast';
import { MOCK_ZONES } from '@/lib/mock-data';
import { HostedZone } from '@/types/hosted-zone';

type UIState = 'idle' | 'loading' | 'error' | 'empty';
type Toast = { id: string; type: 'success' | 'error' | 'info'; title: string; message?: string } | null;

interface FormData {
  name: string;
  type: 'Public' | 'Private';
}

const ITEMS_PER_PAGE = 5;

export default function HostedZonesPage() {
  const router = useRouter();

  // Data management
  const [zones, setZones] = useState<HostedZone[]>(MOCK_ZONES);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // UI states
  const [uiState, setUiState] = useState<UIState>('idle');
  const [toast, setToast] = useState<Toast>(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<HostedZone | null>(null);

  // Form states
  const [formData, setFormData] = useState<FormData>({ name: '', type: 'Public' });

  // Filtered and paginated data
  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || zone.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [zones, searchTerm, filterType]);

  const totalPages = Math.ceil(filteredZones.length / ITEMS_PER_PAGE);
  const paginatedZones = filteredZones.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset pagination when filtering
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  // Toast management
  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString();
    setToast({ id, type, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateOpen = () => {
    router.push('/hosted-zones/create');
  };

  // Edit zone
  const handleEditOpen = (zone: HostedZone) => {
    setSelectedZone(zone);
    setFormData({ name: zone.name, type: zone.type });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('error', 'Validation error', 'Zone name is required');
      return;
    }

    if (selectedZone && formData.name !== selectedZone.name && zones.some((z) => z.name === formData.name)) {
      showToast('error', 'Zone exists', `Zone "${formData.name}" already exists`);
      return;
    }

    if (selectedZone) {
      setZones(zones.map((z) => (z.id === selectedZone.id ? { ...z, name: formData.name, type: formData.type } : z)));
      setShowEditModal(false);
      showToast('success', 'Zone updated', `"${formData.name}" has been updated successfully`);
    }
  };

  // Delete zone
  const handleDeleteOpen = (zone: HostedZone) => {
    setSelectedZone(zone);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedZone) {
      setZones(zones.filter((z) => z.id !== selectedZone.id));
      setShowDeleteModal(false);
      showToast('success', 'Zone deleted', `"${selectedZone.name}" has been deleted successfully`);
    }
  };

  // Simulate loading state for demo
  const handleSimulateLoading = () => {
    setUiState('loading');
    setTimeout(() => setUiState('idle'), 2000);
  };

  const handleSimulateError = () => {
    setUiState('error');
  };

  const handleDismissError = () => {
    setUiState('idle');
  };

  return (
    <AppShell>
      <Breadcrumbs
        items={[
          { label: 'Route53', href: '/', active: false },
          { label: 'Hosted zones', active: true },
        ]}
      />

      <PageContainer
        title="Hosted Zones"
        description="Manage your public and private DNS zones"
        actions={
          <>
            <Button variant="secondary" onClick={handleSimulateError}>
              Simulate Error
            </Button>
            <Button variant="secondary" onClick={handleSimulateLoading}>
              Simulate Loading
            </Button>
            <Button onClick={handleCreateOpen}>Create Hosted Zone</Button>
          </>
        }
      >
        {/* Error State */}
        {uiState === 'error' && (
          <div className="space-y-3">
            <ErrorState
              title="Failed to load hosted zones"
              message="The server encountered an error. Please try again."
            />
            <Button variant="secondary" onClick={handleDismissError}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Loading State */}
        {uiState === 'loading' && <LoadingState label="Loading hosted zones..." />}

        {/* Idle/Normal State */}
        {uiState === 'idle' && (
          <>
            {/* Toast Notification */}
            {toast && (
              <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
                <Toast title={toast.title} message={toast.message} tone={toast.type} />
              </div>
            )}

            {/* Search and Filter Bar */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-soft p-4 mb-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex-1 md:flex-initial">
                  <Input
                    placeholder="Search zones by domain name..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    type="text"
                  />
                </div>

                <div className="w-full md:w-auto">
                  <Select
                    options={[
                      { label: 'All types', value: 'all' },
                      { label: 'Public', value: 'Public' },
                      { label: 'Private', value: 'Private' },
                    ]}
                    value={filterType}
                    onChange={(e) => handleFilterChange(e.target.value)}
                  />
                </div>

                <div className="text-sm text-slate-600">
                  {filteredZones.length} of {zones.length} zones
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredZones.length === 0 && searchTerm === '' && (
              <EmptyState
                title="No hosted zones yet"
                description="Create your first hosted zone to start managing DNS records."
                action={<Button onClick={handleCreateOpen}>Create Hosted Zone</Button>}
              />
            )}

            {/* No Search Results */}
            {filteredZones.length === 0 && searchTerm !== '' && (
              <EmptyState
                title="No zones found"
                description={`No hosted zones match "${searchTerm}". Try a different search term.`}
                action={<Button variant="secondary" onClick={() => handleSearch('')}>Clear search</Button>}
              />
            )}

            {/* Zones Table */}
            {filteredZones.length > 0 && (
              <>
                <div className="rounded-lg border border-slate-200 bg-white shadow-soft overflow-hidden">
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
                      { key: 'type', header: 'Type' },
                      { key: 'recordCount', header: 'Records', className: 'text-center' },
                      {
                        key: 'status',
                        header: 'Status',
                        render: (value) => (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                            ✓ {String(value)}
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
                    data={paginatedZones}
                    emptyMessage="No zones to display"
                  />
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-end">
                    <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </PageContainer>

      {/* Edit Modal */}
      <Modal open={showEditModal} title="Edit Hosted Zone" onClose={() => setShowEditModal(false)} size="md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Domain Name"
            placeholder="example.com"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />

          <Select
            label="Zone Type"
            options={[
              { label: 'Public hosted zone', value: 'Public' },
              { label: 'Private hosted zone', value: 'Private' },
            ]}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Public' | 'Private' })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        title="Delete Hosted Zone"
        onClose={() => setShowDeleteModal(false)}
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">
              Are you sure you want to delete <strong>{selectedZone?.name}</strong>? This action cannot be undone. All
              DNS records in this zone will be deleted.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteConfirm}>
              Delete Zone
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
