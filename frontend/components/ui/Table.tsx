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
}

export function Table<T extends Record<string, any>>({ columns, data, emptyMessage = 'No records found', className }: TableProps<T>) {
  if (!data.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={clsx('overflow-hidden rounded-lg border border-slate-200 bg-white', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className={clsx('px-4 py-3 font-semibold text-slate-700', column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50">
                {columns.map((column) => {
                  const rawValue = row[column.key as keyof T];
                  const content = column.render ? column.render(rawValue, row) : rawValue ?? '—';

                  return (
                    <td key={String(column.key) + rowIndex} className={clsx('px-4 py-3 align-middle', column.className)}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
