'use client';

import clsx from 'clsx';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  flat?: boolean;
  getRowKey?: (row: T, index: number) => string | number;
  selectedRowKey?: string | number;
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'No records found',
  className,
  flat = false,
  getRowKey,
  selectedRowKey,
  onRowClick,
}: TableProps<T>) {
  if (!data.length) {
    return (
      <div className="border border-aws-border bg-white px-4 py-10 text-center text-sm text-aws-muted">{emptyMessage}</div>
    );
  }

  return (
    <div className={clsx(flat ? '' : 'border border-aws-border bg-white', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-aws-sm text-aws-text">
          <thead>
            <tr className="border-b border-aws-border bg-aws-grayPanel">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={clsx('px-4 py-2 font-bold text-aws-text', column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const rowKey = getRowKey?.(row, rowIndex) ?? ('id' in row ? row.id : rowIndex);

              return (
                <tr
                  key={rowKey}
                  className={clsx(
                    'border-b border-aws-borderLight hover:bg-aws-grayPanel/60',
                    onRowClick && 'cursor-pointer',
                    selectedRowKey === rowKey && 'bg-aws-link/5',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => {
                    const rawValue = row[column.key as keyof T];
                    const content = column.render ? column.render(rawValue, row) : rawValue ?? '—';

                    return (
                      <td key={String(column.key)} className={clsx('px-4 py-2 align-middle', column.className)}>
                        {content as React.ReactNode}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
