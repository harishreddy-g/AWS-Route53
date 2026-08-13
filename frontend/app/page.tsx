'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { Table } from '@/components/ui/Table';
import { Toast } from '@/components/ui/Toast';

const hostedZones = [
  { name: 'example.com', status: 'Published', records: 18, type: 'Public hosted zone' },
  { name: 'app.internal', status: 'Private', records: 7, type: 'Private hosted zone' },
  { name: 'demo.net', status: 'Published', records: 24, type: 'Public hosted zone' },
];

export default function HomePage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: 'Route53', href: '#', active: false }, { label: 'Hosted zones', active: true }]} />

      <PageContainer
        title="Hosted zones"
        description="Manage your public and private DNS zones from a single console."
        actions={
          <>
            <Button variant="secondary">Import zone</Button>
            <Button>Create hosted zone</Button>
          </>
        }
      >
        <StatusMessage title="Success" message="The dashboard is ready for zone management work." type="success" />

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Input placeholder="Search hosted zones" className="min-w-[220px]" />
              </div>
              <div className="flex items-center gap-3">
                <Select
                  options={[
                    { label: 'All types', value: 'all' },
                    { label: 'Public', value: 'public' },
                    { label: 'Private', value: 'private' },
                  ]}
                  defaultValue="all"
                  className="min-w-[180px]"
                />
              </div>
            </div>

            <Table
              columns={[
                { key: 'name', header: 'Domain name' },
                { key: 'type', header: 'Type' },
                { key: 'records', header: 'Records' },
                {
                  key: 'status',
                  header: 'Status',
                  render: (value) => (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">{String(value)}</span>
                  ),
                },
              ]}
              data={hostedZones}
            />

            <div className="mt-4 flex justify-end">
              <Pagination page={1} totalPages={3} onPageChange={() => undefined} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Quick actions</div>
              <div className="space-y-2">
                <Button className="w-full justify-center">Create record set</Button>
                <Button variant="secondary" className="w-full justify-center">Transfer domain</Button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Notification</div>
              <Toast title="DNS config saved" message="Changes are ready to propagate." tone="success" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <LoadingState label="Checking health status" />
          <EmptyState title="No DNS records yet" description="Create your first record to start routing traffic." action={<Button variant="secondary">Add record</Button>} />
          <ErrorState title="Sync failed" message="The latest DNS snapshot could not be refreshed." />
        </div>
      </PageContainer>

      <Modal open={false} title="Create hosted zone" onClose={() => undefined}>
        <div className="space-y-4">
          <Input label="Domain name" placeholder="example.com" />
          <Select
            label="Type"
            options={[
              { label: 'Public hosted zone', value: 'public' },
              { label: 'Private hosted zone', value: 'private' },
            ]}
            defaultValue="public"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary">Cancel</Button>
            <Button>Create</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
