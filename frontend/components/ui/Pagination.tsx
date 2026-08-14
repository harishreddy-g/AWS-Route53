'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  compact?: boolean;
}

export function Pagination({ page, totalPages, onPageChange, compact = false }: PaginationProps) {
  if (totalPages <= 1) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-aws-sm text-aws-text">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded border border-aws-border bg-white px-2 py-0.5 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-aws-grayPanel"
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className="min-w-[1.5rem] text-center">{page}</span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded border border-aws-border bg-white px-2 py-0.5 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-aws-grayPanel"
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-2 text-aws-sm text-aws-muted">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded border border-aws-border bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-aws-grayPanel"
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
        className="rounded border border-aws-border bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-aws-grayPanel"
      >
        Next
      </button>
    </div>
  );
}
