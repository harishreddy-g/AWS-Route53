'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-2 text-sm text-slate-600">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
