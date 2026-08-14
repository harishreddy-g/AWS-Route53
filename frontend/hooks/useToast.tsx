'use client';

import { useCallback, useState } from 'react';
import { Toast } from '@/components/ui/Toast';

type ToastState = {
  tone: 'success' | 'error' | 'info';
  title: string;
  message?: string;
} | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((tone: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToast({ tone, title, message });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const toastElement = toast ? (
    <div className="fixed bottom-4 right-4 z-50">
      <Toast title={toast.title} message={toast.message} tone={toast.tone} />
    </div>
  ) : null;

  return { showToast, toastElement };
}
