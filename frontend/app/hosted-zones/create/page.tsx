'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  CreateHostedZoneForm,
  CreateHostedZoneFormData,
} from '@/components/hosted-zones/CreateHostedZoneForm';
import { Toast } from '@/components/ui/Toast';

type ToastState = {
  tone: 'success' | 'error' | 'info';
  title: string;
  message?: string;
} | null;

export default function CreateHostedZonePage() {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (tone: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToast({ tone, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancel = () => {
    router.push('/hosted-zones');
  };

  const handleSuccess = (data: CreateHostedZoneFormData) => {
    showToast('success', 'Zone created', `${data.zoneName.trim()} has been created successfully.`);

    setTimeout(() => {
      router.push('/hosted-zones');
    }, 1500);
  };

  return (
    <AppShell>
      <Breadcrumbs
        items={[
          { label: 'Route53', href: '/' },
          { label: 'Hosted zones', href: '/hosted-zones' },
          { label: 'Create zone', href: '/hosted-zones/create', active: true },
        ]}
      />

      <PageContainer
        title="Create hosted zone"
        description="Create a new hosted zone to manage your domain's DNS records."
      >
        <CreateHostedZoneForm variant="page" onCancel={handleCancel} onSuccess={handleSuccess} />
      </PageContainer>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast title={toast.title} message={toast.message} tone={toast.tone} />
        </div>
      ) : null}
    </AppShell>
  );
}
