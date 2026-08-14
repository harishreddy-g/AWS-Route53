'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="-mt-1 mb-4 flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-1">
          {index > 0 ? <span className="text-aws-muted">›</span> : null}
          {item.href && !item.active ? (
            <Link href={item.href} className="aws-link no-underline hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className={item.active ? 'font-normal text-aws-text' : 'text-aws-muted'}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
