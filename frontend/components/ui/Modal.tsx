'use client';

import clsx from 'clsx';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
};

export function Modal({ open, title, onClose, children, size = 'md' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-16">
      <div className={clsx('w-full border border-aws-border bg-white shadow-aws', sizeClasses[size])}>
        <div className="flex items-center justify-between border-b border-aws-border px-5 py-3">
          <h3 className="text-base font-bold text-aws-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-aws-muted hover:text-aws-text"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
