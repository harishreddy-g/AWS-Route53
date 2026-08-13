export const RECORD_TYPES = [
  'A',
  'AAAA',
  'CNAME',
  'TXT',
  'MX',
  'NS',
  'PTR',
  'SRV',
  'CAA',
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];

export interface DNSRecord {
  id: string;
  hostedZoneId: string;
  name: string;
  type: RecordType;
  value: string;
  ttl: number;
  priority?: number;
  weight?: number;
  port?: number;
  target?: string;
  flag?: number;
  tag?: string;
}

export interface RecordFormData {
  name: string;
  type: RecordType;
  value: string;
  ttl: number;
  priority?: number;
  weight?: number;
  port?: number;
  target?: string;
  flag?: number;
  tag?: string;
}
