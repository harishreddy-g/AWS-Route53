'use client';

import { ReactNode, useState } from 'react';
import clsx from 'clsx';
import { HostedZone } from '@/types/hosted-zone';

interface ZoneInfoPanelProps {
  zone: HostedZone;
  recordCount: number;
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b border-aws-borderLight py-2.5 last:border-b-0">
      <dt className="text-sm text-aws-muted">{label}</dt>
      <dd className={clsx('text-sm text-aws-text', mono ? 'font-mono text-xs' : '')}>{value}</dd>
    </div>
  );
}

export function ZoneInfoPanel({ zone, recordCount }: ZoneInfoPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="aws-panel">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-2 border-b border-aws-border px-4 py-2.5 text-left hover:bg-aws-grayPanel"
      >
        <span className="text-xs text-aws-muted">{expanded ? '▼' : '▶'}</span>
        <span className="text-sm font-bold text-aws-text">Hosted zone details</span>
      </button>

      {expanded ? (
        <dl className="px-4 py-1">
          <InfoRow label="Hosted zone name" value={zone.name} mono />
          <InfoRow label="Hosted zone ID" value={String(zone.id)} mono />
          <InfoRow label="Zone type" value={zone.zoneType} />
          <InfoRow label="Record count" value={String(recordCount)} />
          <InfoRow label="Description" value={zone.description || '—'} />
          <InfoRow
            label="Created"
            value={new Date(zone.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          />
          <InfoRow
            label="Last updated"
            value={new Date(zone.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          />
        </dl>
      ) : null}
    </section>
  );
}

export function PublicBadge({ zoneType = 'public' }: { zoneType?: 'public' | 'private' }) {
  return (
    <span className="inline-flex items-center rounded border border-aws-link bg-aws-link/10 px-2 py-0.5 text-xs font-bold text-aws-link capitalize">
      {zoneType}
    </span>
  );
}

interface PageTabsProps {
  tabs: Array<{ label: string; active?: boolean; count?: number }>;
}

export function PageTabs({ tabs }: PageTabsProps) {
  return (
    <div className="flex border-b border-aws-border bg-white">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className={clsx(
            'border-b-2 px-4 py-2.5 text-sm transition',
            tab.active
              ? 'border-aws-orange font-bold text-aws-text'
              : 'border-transparent text-aws-muted hover:text-aws-text',
          )}
        >
          {tab.label}
          {tab.count !== undefined ? ` (${tab.count})` : ''}
        </button>
      ))}
    </div>
  );
}

interface TableToolbarProps {
  title: string;
  count?: number;
  actions?: ReactNode;
  onRefresh?: () => void;
  pagination?: ReactNode;
}

export function TableToolbar({ title, count, actions, onRefresh, pagination }: TableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-aws-border bg-white px-4 py-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-aws-text">
          {title}
          {count !== undefined ? ` (${count})` : ''}
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded border border-aws-border bg-white p-1.5 text-aws-muted hover:bg-aws-grayPanel hover:text-aws-text"
            aria-label="Refresh"
          >
            ↻
          </button>
        ) : null}
        {actions}
        {pagination}
      </div>
    </div>
  );
}
