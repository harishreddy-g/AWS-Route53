'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';

const PRODUCTS = [
  { title: 'Domain names', description: 'Register and manage domain names with Route 53.' },
  { title: 'Hosted zones', description: 'Create and manage DNS records for your domains.', href: '/hosted-zones' },
  { title: 'Health checks', description: 'Monitor the health and performance of your resources.' },
  { title: 'Traffic flow', description: 'Manage traffic globally through a variety of routing types.' },
  { title: 'Resolver', description: 'Route DNS queries between your VPC and your network.' },
];

const SUMMARY_CARDS = [
  {
    title: 'DNS management',
    stat: '—',
    label: 'Hosted zones',
    action: { label: 'Create hosted zone', href: '/hosted-zones/create' },
  },
  {
    title: 'Availability monitoring',
    description: 'Health checks are available for endpoints that are accessible from the internet.',
    action: { label: 'Create health check', href: '#' },
  },
  {
    title: 'Traffic management',
    description: 'Use traffic policies to manage how traffic is routed to your resources.',
    action: { label: 'Create policy', href: '#' },
  },
  {
    title: 'Domain registration',
    description: 'Register a domain to get started with Route 53.',
    action: { label: 'Register domain', href: '#' },
  },
];

export default function DashboardPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Route 53', href: '/dashboard' },
          { label: 'Dashboard', active: true },
        ]}
      />

      <PageContainer title="Dashboard">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SUMMARY_CARDS.map((card) => (
            <section key={card.title} className="aws-panel p-4">
              <h2 className="text-sm font-bold text-aws-text">{card.title}</h2>
              {card.stat ? (
                <div className="mt-3">
                  <div className="text-3xl font-normal text-aws-link">{card.stat}</div>
                  <div className="text-sm text-aws-muted">{card.label}</div>
                </div>
              ) : null}
              {card.description ? <p className="mt-3 text-sm text-aws-muted">{card.description}</p> : null}
              {card.action ? (
                <div className="mt-4">
                  {card.action.href === '#' ? (
                    <Button variant="secondary" size="sm" disabled>
                      {card.action.label}
                    </Button>
                  ) : (
                    <Link href={card.action.href}>
                      <Button variant="secondary" size="sm">
                        {card.action.label}
                      </Button>
                    </Link>
                  )}
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <section className="aws-panel p-5">
          <h2 className="mb-4 text-base font-bold text-aws-text">Register domain</h2>
          <Input search placeholder="Enter a domain name (example.com)" />
          <Button variant="secondary" size="sm" className="mt-3" disabled>
            Check
          </Button>
        </section>

        <section className="aws-panel">
          <div className="border-b border-aws-border px-4 py-3">
            <h2 className="text-sm font-bold text-aws-text">Notifications</h2>
          </div>
          <Table
            flat
            columns={[
              { key: 'resource', header: 'Resource' },
              { key: 'status', header: 'Status' },
              { key: 'updated', header: 'Last update' },
            ]}
            data={[]}
            emptyMessage="No notifications to display"
          />
        </section>

        <section className="aws-panel p-5">
          <h2 className="mb-4 text-base font-bold text-aws-text">Products</h2>
          <div className="divide-y divide-aws-borderLight">
            {PRODUCTS.map((product) => (
              <div key={product.title} className="flex gap-4 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-aws-border bg-aws-grayPanel text-xs font-bold text-aws-link">
                  53
                </div>
                <div>
                  {product.href ? (
                    <Link href={product.href} className="aws-link text-sm font-bold">
                      {product.title}
                    </Link>
                  ) : (
                    <div className="text-sm font-bold text-aws-text">{product.title}</div>
                  )}
                  <p className="mt-1 text-sm text-aws-muted">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  );
}
