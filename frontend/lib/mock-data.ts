import { HostedZone } from '@/types/hosted-zone';
import { DNSRecord } from '@/types/dns-record';

export const MOCK_ZONES: HostedZone[] = [
  {
    id: '1',
    name: 'example.com',
    type: 'Public',
    description: 'Primary production zone',
    recordCount: 12,
    status: 'Published',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'app.internal',
    type: 'Private',
    description: 'Internal services VPC',
    recordCount: 6,
    status: 'Active',
    createdAt: '2024-02-10',
  },
  {
    id: '3',
    name: 'demo.net',
    type: 'Public',
    recordCount: 8,
    status: 'Published',
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    name: 'staging.example.com',
    type: 'Public',
    recordCount: 5,
    status: 'Published',
    createdAt: '2024-03-05',
  },
  {
    id: '5',
    name: 'api.example.com',
    type: 'Public',
    recordCount: 4,
    status: 'Published',
    createdAt: '2024-02-28',
  },
  {
    id: '6',
    name: 'cdn.example.com',
    type: 'Public',
    recordCount: 3,
    status: 'Published',
    createdAt: '2024-03-12',
  },
  {
    id: '7',
    name: 'mail.example.com',
    type: 'Public',
    recordCount: 3,
    status: 'Published',
    createdAt: '2024-01-25',
  },
  {
    id: '8',
    name: 'test.internal',
    type: 'Private',
    recordCount: 4,
    status: 'Active',
    createdAt: '2024-03-20',
  },
];

export const MOCK_DNS_RECORDS: DNSRecord[] = [
  // example.com — full record type showcase
  { id: 'r1', hostedZoneId: '1', name: 'example.com', type: 'A', value: '192.0.2.1', ttl: 300 },
  { id: 'r2', hostedZoneId: '1', name: 'example.com', type: 'AAAA', value: '2001:db8::1', ttl: 300 },
  { id: 'r3', hostedZoneId: '1', name: 'www.example.com', type: 'CNAME', value: 'example.com', ttl: 300 },
  { id: 'r4', hostedZoneId: '1', name: 'example.com', type: 'MX', value: 'mail.example.com', ttl: 3600, priority: 10 },
  { id: 'r5', hostedZoneId: '1', name: 'example.com', type: 'MX', value: 'mail2.example.com', ttl: 3600, priority: 20 },
  { id: 'r6', hostedZoneId: '1', name: 'example.com', type: 'TXT', value: 'v=spf1 include:_spf.example.com ~all', ttl: 300 },
  { id: 'r7', hostedZoneId: '1', name: '_dmarc.example.com', type: 'TXT', value: 'v=DMARC1; p=reject; rua=mailto:dmarc@example.com', ttl: 300 },
  { id: 'r8', hostedZoneId: '1', name: 'example.com', type: 'NS', value: 'ns-123.awsdns-12.com', ttl: 172800 },
  { id: 'r9', hostedZoneId: '1', name: 'example.com', type: 'NS', value: 'ns-456.awsdns-45.net', ttl: 172800 },
  { id: 'r10', hostedZoneId: '1', name: '_sip._tcp.example.com', type: 'SRV', value: 'sip.example.com', ttl: 300, priority: 10, weight: 5, port: 5060, target: 'sip.example.com' },
  { id: 'r11', hostedZoneId: '1', name: 'example.com', type: 'CAA', value: 'letsencrypt.org', ttl: 300, flag: 0, tag: 'issue' },
  { id: 'r12', hostedZoneId: '1', name: '192.0.2.1.in-addr.arpa', type: 'PTR', value: 'host.example.com', ttl: 300 },
  { id: 'r13', hostedZoneId: '1', name: 'api.example.com', type: 'A', value: '192.0.2.50', ttl: 60 },
  { id: 'r14', hostedZoneId: '1', name: 'cdn.example.com', type: 'CNAME', value: 'd111111abcdef8.cloudfront.net', ttl: 300 },
  { id: 'r15', hostedZoneId: '1', name: 'staging.example.com', type: 'A', value: '192.0.2.99', ttl: 300 },

  // app.internal
  { id: 'r20', hostedZoneId: '2', name: 'app.internal', type: 'A', value: '10.0.1.10', ttl: 300 },
  { id: 'r21', hostedZoneId: '2', name: 'db.app.internal', type: 'A', value: '10.0.1.20', ttl: 300 },
  { id: 'r22', hostedZoneId: '2', name: 'cache.app.internal', type: 'CNAME', value: 'db.app.internal', ttl: 300 },
  { id: 'r23', hostedZoneId: '2', name: 'app.internal', type: 'NS', value: 'ns-789.awsdns-78.org', ttl: 172800 },
  { id: 'r24', hostedZoneId: '2', name: '_ldap._tcp.app.internal', type: 'SRV', value: 'ldap.app.internal', ttl: 300, priority: 0, weight: 10, port: 389, target: 'ldap.app.internal' },
  { id: 'r25', hostedZoneId: '2', name: 'app.internal', type: 'TXT', value: 'internal-zone-marker', ttl: 300 },

  // demo.net
  { id: 'r30', hostedZoneId: '3', name: 'demo.net', type: 'A', value: '198.51.100.10', ttl: 300 },
  { id: 'r31', hostedZoneId: '3', name: 'www.demo.net', type: 'CNAME', value: 'demo.net', ttl: 300 },
  { id: 'r32', hostedZoneId: '3', name: 'demo.net', type: 'MX', value: 'aspmx.l.google.com', ttl: 3600, priority: 1 },
  { id: 'r33', hostedZoneId: '3', name: 'demo.net', type: 'TXT', value: 'google-site-verification=abc123', ttl: 300 },
  { id: 'r34', hostedZoneId: '3', name: 'demo.net', type: 'NS', value: 'ns-111.awsdns-11.co.uk', ttl: 172800 },
  { id: 'r35', hostedZoneId: '3', name: 'demo.net', type: 'CAA', value: 'amazon.com', ttl: 300, flag: 0, tag: 'issuewild' },
  { id: 'r36', hostedZoneId: '3', name: 'blog.demo.net', type: 'A', value: '198.51.100.20', ttl: 300 },
  { id: 'r37', hostedZoneId: '3', name: 'blog.demo.net', type: 'AAAA', value: '2001:db8:85a3::8a2e:370:7334', ttl: 300 },

  // staging.example.com
  { id: 'r40', hostedZoneId: '4', name: 'staging.example.com', type: 'A', value: '192.0.2.200', ttl: 60 },
  { id: 'r41', hostedZoneId: '4', name: 'staging.example.com', type: 'TXT', value: 'staging-environment', ttl: 300 },
  { id: 'r42', hostedZoneId: '4', name: 'staging.example.com', type: 'NS', value: 'ns-222.awsdns-22.com', ttl: 172800 },
  { id: 'r43', hostedZoneId: '4', name: 'app.staging.example.com', type: 'CNAME', value: 'staging.example.com', ttl: 300 },
  { id: 'r44', hostedZoneId: '4', name: 'staging.example.com', type: 'CAA', value: 'letsencrypt.org', ttl: 300, flag: 0, tag: 'issue' },

  // api.example.com
  { id: 'r50', hostedZoneId: '5', name: 'api.example.com', type: 'A', value: '192.0.2.55', ttl: 60 },
  { id: 'r51', hostedZoneId: '5', name: 'v2.api.example.com', type: 'CNAME', value: 'api.example.com', ttl: 300 },
  { id: 'r52', hostedZoneId: '5', name: 'api.example.com', type: 'TXT', value: 'api-endpoint-zone', ttl: 300 },
  { id: 'r53', hostedZoneId: '5', name: 'api.example.com', type: 'NS', value: 'ns-333.awsdns-33.net', ttl: 172800 },

  // cdn.example.com
  { id: 'r60', hostedZoneId: '6', name: 'cdn.example.com', type: 'CNAME', value: 'd222222abcdef8.cloudfront.net', ttl: 300 },
  { id: 'r61', hostedZoneId: '6', name: 'cdn.example.com', type: 'A', value: '192.0.2.77', ttl: 300 },
  { id: 'r62', hostedZoneId: '6', name: 'cdn.example.com', type: 'NS', value: 'ns-444.awsdns-44.org', ttl: 172800 },

  // mail.example.com
  { id: 'r70', hostedZoneId: '7', name: 'mail.example.com', type: 'A', value: '192.0.2.88', ttl: 300 },
  { id: 'r71', hostedZoneId: '7', name: 'mail.example.com', type: 'MX', value: 'mail.example.com', ttl: 3600, priority: 10 },
  { id: 'r72', hostedZoneId: '7', name: 'mail.example.com', type: 'TXT', value: 'v=spf1 a mx ~all', ttl: 300 },

  // test.internal
  { id: 'r80', hostedZoneId: '8', name: 'test.internal', type: 'A', value: '10.0.2.10', ttl: 300 },
  { id: 'r81', hostedZoneId: '8', name: 'qa.test.internal', type: 'A', value: '10.0.2.20', ttl: 300 },
  { id: 'r82', hostedZoneId: '8', name: 'test.internal', type: 'NS', value: 'ns-555.awsdns-55.com', ttl: 172800 },
  { id: 'r83', hostedZoneId: '8', name: 'test.internal', type: 'PTR', value: 'gateway.test.internal', ttl: 300 },
];

export function getZoneById(id: string): HostedZone | undefined {
  return MOCK_ZONES.find((zone) => zone.id === id);
}

export function getRecordsByZoneId(zoneId: string): DNSRecord[] {
  return MOCK_DNS_RECORDS.filter((record) => record.hostedZoneId === zoneId);
}

export function generateRecordId(): string {
  return `r${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
