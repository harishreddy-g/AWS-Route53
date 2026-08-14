'use client';

import { useParams, useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { DNSRecordForm } from '@/components/hosted-zones/DNSRecordForm';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useHostedZone } from '@/hooks/useHostedZone';
import { useToast } from '@/hooks/useToast';
import { dnsRecords, getErrorMessage } from '@/lib/api';
import { RecordFormData } from '@/types/dns-record';

export default function CreateRecordPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const zoneId = Number(params.id);
  const { zone, isLoading, error } = useHostedZone(zoneId);
  const { showToast, toastElement } = useToast();

  const handleCancel = () => router.push(`/hosted-zones/${zoneId}`);

  const handleSubmit = async (form: RecordFormData) => {
    try {
      await dnsRecords.create(zoneId, form);
      showToast('success', 'Record created', `${form.name.trim()} (${form.type}) was added.`);
      setTimeout(() => router.push(`/hosted-zones/${zoneId}`), 1200);
    } catch (submitError) {
      showToast('error', 'Create failed', getErrorMessage(submitError));
      throw submitError;
    }
  };

  if (isLoading) {
    return <LoadingState label="Loading hosted zone..." />;
  }

  if (error || !zone) {
    return <ErrorState title="Zone not found" message={error || 'Unable to load hosted zone.'} />;
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Route 53', href: '/dashboard' },
          { label: 'Hosted zones', href: '/hosted-zones' },
          { label: zone.name, href: `/hosted-zones/${zoneId}` },
          { label: 'Create record', active: true },
        ]}
      />

      <PageContainer title="Create record">
        <DNSRecordForm zoneName={zone.name} mode="create" variant="page" onCancel={handleCancel} onSubmit={handleSubmit} />
      </PageContainer>

      {toastElement}
    </>
  );
}
