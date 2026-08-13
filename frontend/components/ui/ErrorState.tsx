'use client';

interface ErrorStateProps {
  title?: string;
  message?: string;
}

export function ErrorState({ title = 'Something went wrong', message = 'The data could not be loaded.' }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div className="font-semibold">{title}</div>
      <div className="mt-1">{message}</div>
    </div>
  );
}
