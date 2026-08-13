'use client';

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
    <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {index > 0 ? <span>/</span> : null}
          {item.href && !item.active ? (
            <a href={item.href} className="transition hover:text-slate-700">
              {item.label}
            </a>
          ) : (
            <span className={item.active ? 'font-medium text-slate-700' : ''}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
