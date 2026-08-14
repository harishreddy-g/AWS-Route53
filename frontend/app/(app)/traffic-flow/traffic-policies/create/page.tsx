'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { trafficPolicies, getErrorMessage, type RoutingType } from '@/lib/api';

const ROUTING_TYPES: { label: string; value: RoutingType; description: string }[] = [
  { value: 'Simple', label: 'Simple routing', description: 'Route traffic to a single resource such as a web server.' },
  { value: 'Weighted', label: 'Weighted routing', description: 'Route traffic to multiple resources in proportions you specify.' },
  { value: 'Latency', label: 'Latency routing', description: 'Route traffic to the AWS region that provides the best latency.' },
  { value: 'Failover', label: 'Failover routing', description: 'Route traffic to a primary resource and fail over to a secondary.' },
  { value: 'Geolocation', label: 'Geolocation routing', description: 'Route traffic based on the geographic location of users.' },
  { value: 'Multivalue', label: 'Multivalue answer routing', description: 'Respond to DNS queries with up to eight healthy records.' },
  { value: 'IP-based', label: 'IP-based routing', description: 'Route traffic based on the IP address of the DNS query origin.' },
];

// Default document templates per routing type
const DEFAULT_DOCUMENTS: Record<RoutingType, object> = {
  Simple: { type: 'simple', endpoints: [{ id: 'ep1', type: 'value', value: '1.2.3.4' }] },
  Weighted: { type: 'weighted', endpoints: [
    { id: 'ep1', type: 'value', value: '1.2.3.4', weight: 50 },
    { id: 'ep2', type: 'value', value: '5.6.7.8', weight: 50 },
  ]},
  Latency: { type: 'latency', endpoints: [
    { id: 'ep1', type: 'value', value: '1.2.3.4', region: 'us-east-1' },
    { id: 'ep2', type: 'value', value: '5.6.7.8', region: 'eu-west-1' },
  ]},
  Failover: { type: 'failover', endpoints: [
    { id: 'primary', type: 'value', value: '1.2.3.4', role: 'PRIMARY' },
    { id: 'secondary', type: 'value', value: '5.6.7.8', role: 'SECONDARY' },
  ]},
  Geolocation: { type: 'geolocation', endpoints: [
    { id: 'ep1', type: 'value', value: '1.2.3.4', continent: 'NA' },
    { id: 'default', type: 'value', value: '5.6.7.8', isDefault: true },
  ]},
  Multivalue: { type: 'multivalue', endpoints: [
    { id: 'ep1', type: 'value', value: '1.2.3.4' },
    { id: 'ep2', type: 'value', value: '5.6.7.8' },
  ]},
  'IP-based': { type: 'ip-based', endpoints: [
    { id: 'ep1', type: 'value', value: '1.2.3.4', cidrCollection: 'my-collection' },
  ]},
};

export default function CreateTrafficPolicyPage() {
  const router = useRouter();
  const { showToast, toastElement } = useToast();
  const [name, setName] = useState('');
  const [routingType, setRoutingType] = useState<RoutingType>('Simple');
  const [comment, setComment] = useState('');
  const [document, setDocument] = useState(JSON.stringify(DEFAULT_DOCUMENTS['Simple'], null, 2));
  const [jsonError, setJsonError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedType = ROUTING_TYPES.find((t) => t.value === routingType)!;

  const handleRoutingTypeChange = (type: RoutingType) => {
    setRoutingType(type);
    setDocument(JSON.stringify(DEFAULT_DOCUMENTS[type], null, 2));
    setJsonError('');
  };

  const handleDocumentChange = (value: string) => {
    setDocument(value);
    try {
      JSON.parse(value);
      setJsonError('');
    } catch {
      setJsonError('Invalid JSON — please fix syntax errors before saving.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (jsonError) return;
    setIsSaving(true);
    try {
      await trafficPolicies.create({
        name: name.trim(),
        routing_type: routingType,
        comment: comment.trim() || null,
        document: document,
      });
      showToast('success', 'Traffic policy created', `"${name}" has been created.`);
      setTimeout(() => router.push('/traffic-flow/traffic-policies'), 1200);
    } catch (err) {
      showToast('error', 'Failed to create policy', getErrorMessage(err));
    } finally { setIsSaving(false); }
  };

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Route 53', href: '/dashboard' },
        { label: 'Traffic policies', href: '/traffic-flow/traffic-policies' },
        { label: 'Create traffic policy', active: true },
      ]} />
      <PageContainer title="Create traffic policy">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Step 1: Basic info */}
          <div className="aws-panel p-5 space-y-4">
            <h2 className="aws-section-title">Policy details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Policy name" placeholder="my-traffic-policy" value={name}
                onChange={(e) => setName(e.target.value)} required autoFocus />
              <Input label="Comment - optional" placeholder="Describe this policy" value={comment}
                onChange={(e) => setComment(e.target.value)} />
            </div>
          </div>

          {/* Step 2: Routing type */}
          <div className="aws-panel p-5 space-y-4">
            <h2 className="aws-section-title">Routing type</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ROUTING_TYPES.map((type) => (
                <button key={type.value} type="button"
                  onClick={() => handleRoutingTypeChange(type.value)}
                  className={[
                    'rounded border p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-aws-link/30',
                    routingType === type.value
                      ? 'border-aws-link bg-aws-link/5 ring-1 ring-aws-link'
                      : 'border-aws-border bg-white hover:border-aws-muted hover:bg-aws-grayPanel',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-aws-text">{type.label}</span>
                    {routingType === type.value && (
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-aws-link text-white flex items-center justify-center text-[10px]">✓</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-aws-muted leading-relaxed">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Policy document editor */}
          <div className="aws-panel p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="aws-section-title">Policy document</h2>
                <p className="mt-1 text-sm text-aws-muted">
                  Define the routing rules for <strong>{selectedType.label}</strong>. Edit the JSON to customize endpoints and routing behavior.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Editor */}
              <div>
                <label className="mb-1 block text-sm font-bold text-aws-text">
                  Policy JSON <span className="aws-info-link">Info</span>
                </label>
                <textarea
                  value={document}
                  onChange={(e) => handleDocumentChange(e.target.value)}
                  rows={20}
                  spellCheck={false}
                  className={[
                    'w-full rounded border bg-white px-3 py-2 font-mono text-xs text-aws-text outline-none transition focus:ring-1',
                    jsonError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : 'border-aws-border focus:border-aws-link focus:ring-aws-link/30',
                  ].join(' ')}
                />
                {jsonError && <p className="mt-1 text-xs text-red-600">{jsonError}</p>}
              </div>

              {/* Live preview */}
              <div>
                <p className="mb-1 text-sm font-bold text-aws-text">Live preview</p>
                <div className="rounded border border-aws-border bg-aws-grayPanel p-4 space-y-3 min-h-[200px]">
                  {(() => {
                    try {
                      const doc = JSON.parse(document);
                      return (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-aws-muted uppercase tracking-wide">Type</span>
                            <span className="rounded bg-aws-link/10 px-2 py-0.5 text-xs font-semibold text-aws-link capitalize">{doc.type ?? routingType}</span>
                          </div>
                          {Array.isArray(doc.endpoints) && doc.endpoints.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-aws-muted uppercase tracking-wide mb-2">Endpoints ({doc.endpoints.length})</p>
                              <div className="space-y-2">
                                {doc.endpoints.map((ep: Record<string, unknown>, i: number) => (
                                  <div key={i} className="rounded border border-aws-border bg-white px-3 py-2">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <span className="font-mono text-xs text-aws-text">{String(ep.value ?? ep.id ?? `endpoint-${i + 1}`)}</span>
                                      <div className="flex gap-2 flex-wrap">
                                        {ep.weight !== undefined && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700">weight: {String(ep.weight)}</span>}
                                        {ep.region != null && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">{String(ep.region)}</span>}
                                        {ep.role != null && <span className={`rounded px-1.5 py-0.5 text-[10px] ${String(ep.role) === 'PRIMARY' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{String(ep.role)}</span>}
                                        {ep.continent != null && <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] text-teal-700">{String(ep.continent)}</span>}
                                        {ep.isDefault != null && <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] text-yellow-700">default</span>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    } catch {
                      return <p className="text-sm text-red-600">Invalid JSON — fix syntax errors to see preview.</p>;
                    }
                  })()}
                </div>
                <p className="mt-2 text-xs text-aws-muted">Preview updates as you type. Save when ready.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="link" onClick={() => router.push('/traffic-flow/traffic-policies')}>Cancel</Button>
            <Button type="submit" loading={isSaving} disabled={!!jsonError || !name.trim()}>
              Create traffic policy
            </Button>
          </div>
        </form>
      </PageContainer>
      {toastElement}
    </>
  );
}
