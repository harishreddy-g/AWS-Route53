'use client';

import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  CreateHostedZoneForm,
  CreateHostedZoneFormData,
} from '@/components/hosted-zones/CreateHostedZoneForm';
import { useToast } from '@/hooks/useToast';
import { hostedZones } from '@/lib/api';

export default function CreateHostedZonePage() {
  const router = useRouter();
  const { showToast, toastElement } = useToast();

  const handleCancel = () => {
    router.push('/hosted-zones');
  };

  const handleCreate = async (data: CreateHostedZoneFormData) => {
    await hostedZones.create({
      name: data.zoneName.trim(),
      description: data.description.trim() || null,
      zone_type: data.zoneType,
    });
  };

  const handleSuccess = (data: CreateHostedZoneFormData) => {
    showToast('success', 'Zone created', `${data.zoneName.trim()} has been created successfully.`);

    setTimeout(() => {
      router.push('/hosted-zones');
    }, 1500);
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Route 53', href: '/dashboard' },
          { label: 'Hosted zones', href: '/hosted-zones' },
          { label: 'Create hosted zone', active: true },
        ]}
      />

      <PageContainer title="Create hosted zone">
        <CreateHostedZoneForm
          variant="page"
          onCancel={handleCancel}
          onCreate={handleCreate}
          onSuccess={handleSuccess}
        />
      </PageContainer>

      {toastElement}
    </>
  );
}
