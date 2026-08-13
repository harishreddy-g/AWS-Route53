'use client';

import { HostedZone } from '@/types/hosted-zone';

interface ZoneInfoPanelProps {
  zone: HostedZone;
  recordCount: number;
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className={`text-sm text-slate-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}

export function ZoneInfoPanel({ zone, recordCount }: ZoneInfoPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">
          Hosted zone details
        </h2>
      </div>

      <dl className="px-5 py-1">
        <InfoRow label="Hosted zone name" value={zone.name} mono />
        <InfoRow label="Hosted zone ID" value={String(zone.id)} mono />
        <InfoRow label="Record count" value={String(recordCount)} />
        <InfoRow label="Comment" value={zone.description || '—'} />
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
    </section>
  );
}
