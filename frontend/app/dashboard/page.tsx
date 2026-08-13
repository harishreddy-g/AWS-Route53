'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { StatusMessage } from '@/components/ui/StatusMessage';
import clsx from 'clsx';

// Mock data
const DASHBOARD_STATS = {
  hostedZones: 5,
  dnsRecords: 127,
  healthChecks: 3,
  aliases: 12,
};

const RECENT_ACTIVITY = [
  {
    id: 1,
    action: 'Created DNS record',
    domain: 'example.com',
    recordType: 'A',
    timestamp: '2 hours ago',
    status: 'success' as const,
  },
  {
    id: 2,
    action: 'Updated hosted zone',
    domain: 'app.internal',
    recordType: 'Private',
    timestamp: '5 hours ago',
    status: 'success' as const,
  },
  {
    id: 3,
    action: 'Created MX record',
    domain: 'mail.example.com',
    recordType: 'MX',
    timestamp: '1 day ago',
    status: 'success' as const,
  },
  {
    id: 4,
    action: 'Modified CNAME record',
    domain: 'www.example.com',
    recordType: 'CNAME',
    timestamp: '2 days ago',
    status: 'success' as const,
  },
  {
    id: 5,
    action: 'Deleted NS record',
    domain: 'staging.example.com',
    recordType: 'NS',
    timestamp: '3 days ago',
    status: 'success' as const,
  },
];

const HOSTED_ZONES_OVERVIEW = [
  { name: 'example.com', type: 'Public', recordCount: 34, status: 'Published' },
  { name: 'app.internal', type: 'Private', recordCount: 18, status: 'Active' },
  { name: 'demo.net', type: 'Public', recordCount: 42, status: 'Published' },
  { name: 'staging.example.com', type: 'Public', recordCount: 21, status: 'Published' },
  { name: 'api.example.com', type: 'Public', recordCount: 12, status: 'Published' },
];

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: 'orange' | 'blue' | 'green' | 'purple';
}

const STAT_CARDS: StatCard[] = [
  {
    label: 'Hosted Zones',
    value: DASHBOARD_STATS.hostedZones,
    icon: '🌐',
    color: 'orange',
  },
  {
    label: 'DNS Records',
    value: DASHBOARD_STATS.dnsRecords,
    icon: '📋',
    color: 'blue',
  },
  {
    label: 'Health Checks',
    value: DASHBOARD_STATS.healthChecks,
    icon: '❤️',
    color: 'green',
  },
  {
    label: 'Aliases',
    value: DASHBOARD_STATS.aliases,
    icon: '🔗',
    color: 'purple',
  },
];

const colorClasses = {
  orange: 'bg-orange-50 border-orange-200',
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  purple: 'bg-purple-50 border-purple-200',
};

const colorTextClasses = {
  orange: 'text-orange-700',
  blue: 'text-blue-700',
  green: 'text-green-700',
  purple: 'text-purple-700',
};

export default function DashboardPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <AppShell>
      <Breadcrumbs items={[{ label: 'Route53', href: '#', active: false }, { label: 'Dashboard', active: true }]} />

      <PageContainer
        title="Dashboard"
        description="Overview of your DNS infrastructure and recent activity"
        actions={
          <>
            <Button variant="secondary">View Activity Log</Button>
            <Button>Create Hosted Zone</Button>
          </>
        }
      >
        {/* Status Banner */}
        <StatusMessage
          title="All systems operational"
          message="Your DNS infrastructure is running smoothly. All health checks are passing."
          type="success"
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((card, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              className={clsx(
                'rounded-lg border-2 p-5 transition-all duration-200',
                colorClasses[card.color],
                hoveredCard === idx ? 'shadow-panel scale-105' : 'shadow-soft',
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{card.icon}</span>
                <div className={clsx('text-2xl font-bold', colorTextClasses[card.color])}>{card.value}</div>
              </div>
              <div className="text-sm font-medium text-slate-700">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity - Takes 2 columns */}
          <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white shadow-soft p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
              <a href="#" className="text-sm text-aws-orange hover:text-aws-orangeDark transition">
                View all
              </a>
            </div>

            <Table
              columns={[
                { key: 'action', header: 'Action', className: 'font-medium' },
                { key: 'domain', header: 'Domain' },
                { key: 'recordType', header: 'Type', className: 'text-center' },
                {
                  key: 'timestamp',
                  header: 'Time',
                  render: (value) => <span className="text-xs text-slate-500">{String(value)}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (value) => (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      ✓ {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
                    </span>
                  ),
                },
              ]}
              data={RECENT_ACTIVITY}
              emptyMessage="No recent activity"
            />
          </div>

          {/* Sidebar - Quick Actions & Stats */}
          <div className="space-y-5">
            {/* Quick Actions */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-soft p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-slate-700">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-center" variant="secondary">
                  Create Record
                </Button>
                <Button className="w-full justify-center" variant="secondary">
                  Import Zone
                </Button>
                <Button className="w-full justify-center" variant="secondary">
                  Check Health
                </Button>
                <Button className="w-full justify-center" variant="secondary">
                  View Reports
                </Button>
              </div>
            </div>

            {/* Alerts */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-soft p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-slate-700">Alerts</h3>
              <div className="space-y-3">
                <div className="rounded bg-blue-50 border border-blue-200 p-3">
                  <div className="text-xs font-medium text-blue-700">ℹ️ Tip</div>
                  <div className="mt-1 text-xs text-blue-600">Enable DNSSEC for enhanced security on your public zones.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hosted Zones Overview */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-soft p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Hosted Zones Overview</h2>
            <a href="/hosted-zones" className="text-sm text-aws-orange hover:text-aws-orangeDark transition">
              Manage all zones
            </a>
          </div>

          <Table
            columns={[
              { key: 'name', header: 'Domain Name', className: 'font-medium' },
              { key: 'type', header: 'Type' },
              { key: 'recordCount', header: 'Records', className: 'text-center' },
              {
                key: 'status',
                header: 'Status',
                render: (value) => (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                    ✓ {String(value)}
                  </span>
                ),
              },
            ]}
            data={HOSTED_ZONES_OVERVIEW}
            emptyMessage="No hosted zones"
          />
        </div>

        {/* Footer Stats */}
        <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {RECENT_ACTIVITY.length}
              </div>
              <div className="text-sm text-slate-600">Changes in the last 7 days</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">100%</div>
              <div className="text-sm text-slate-600">Zone availability</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">~15ms</div>
              <div className="text-sm text-slate-600">Average query latency</div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
