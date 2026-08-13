import { RecordFormData, RecordType } from '@/types/dns-record';

export type RecordFormFieldKey = keyof Pick<
  RecordFormData,
  'value' | 'priority' | 'weight' | 'port' | 'target' | 'flag' | 'tag'
>;

export type RecordFormFieldControl = 'input' | 'textarea' | 'select';

export interface RecordFormFieldDefinition {
  key: RecordFormFieldKey;
  label: string;
  placeholder?: string;
  control?: RecordFormFieldControl;
  inputType?: 'text' | 'number';
  min?: number;
  options?: { label: string; value: string }[];
  hint?: string;
}

export const DEFAULT_TTL = 300;

export const TTL_OPTIONS = [
  { label: '60 seconds', value: '60' },
  { label: '300 seconds (5 min)', value: '300' },
  { label: '900 seconds (15 min)', value: '900' },
  { label: '3600 seconds (1 hour)', value: '3600' },
  { label: '86400 seconds (1 day)', value: '86400' },
];

export const CAA_TAG_OPTIONS = [
  { label: 'issue', value: 'issue' },
  { label: 'issuewild', value: 'issuewild' },
  { label: 'iodef', value: 'iodef' },
];

/**
 * Fields shown after record type selection, in display order.
 * Record name and TTL are always rendered separately.
 */
export const RECORD_TYPE_FIELDS: Record<RecordType, RecordFormFieldDefinition[]> = {
  A: [
    {
      key: 'value',
      label: 'IPv4 address',
      placeholder: '192.0.2.1',
    },
  ],
  AAAA: [
    {
      key: 'value',
      label: 'IPv6 address',
      placeholder: '2001:db8::1',
    },
  ],
  CNAME: [
    {
      key: 'value',
      label: 'Target',
      placeholder: 'target.example.com',
    },
  ],
  TXT: [
    {
      key: 'value',
      label: 'Value',
      placeholder: 'v=spf1 include:example.com ~all',
      control: 'textarea',
    },
  ],
  MX: [
    {
      key: 'priority',
      label: 'Priority',
      inputType: 'number',
      min: 0,
      placeholder: '10',
    },
    {
      key: 'value',
      label: 'Mail server',
      placeholder: 'mail.example.com',
    },
  ],
  NS: [
    {
      key: 'value',
      label: 'Name server',
      placeholder: 'ns-123.awsdns-12.com',
    },
  ],
  PTR: [
    {
      key: 'value',
      label: 'Domain name',
      placeholder: 'host.example.com',
    },
  ],
  SRV: [
    {
      key: 'priority',
      label: 'Priority',
      inputType: 'number',
      min: 0,
      placeholder: '10',
    },
    {
      key: 'weight',
      label: 'Weight',
      inputType: 'number',
      min: 0,
      placeholder: '5',
    },
    {
      key: 'port',
      label: 'Port',
      inputType: 'number',
      min: 1,
      placeholder: '443',
    },
    {
      key: 'target',
      label: 'Target',
      placeholder: 'server.example.com',
    },
  ],
  CAA: [
    {
      key: 'flag',
      label: 'Flag',
      inputType: 'number',
      min: 0,
      placeholder: '0',
    },
    {
      key: 'tag',
      label: 'Tag',
      control: 'select',
      options: CAA_TAG_OPTIONS,
    },
    {
      key: 'value',
      label: 'Value',
      placeholder: 'letsencrypt.org',
    },
  ],
};

export function createEmptyRecordForm(zoneName: string, type: RecordType = 'A'): RecordFormData {
  const form: RecordFormData = {
    name: zoneName,
    type,
    value: '',
    ttl: DEFAULT_TTL,
  };

  applyTypeDefaults(form, type);
  return form;
}

export function applyTypeDefaults(form: RecordFormData, type: RecordType): RecordFormData {
  const next: RecordFormData = {
    name: form.name,
    type,
    value: '',
    ttl: form.ttl || DEFAULT_TTL,
  };

  switch (type) {
    case 'MX':
      next.priority = 10;
      break;
    case 'SRV':
      next.priority = 10;
      next.weight = 0;
      next.port = 443;
      next.target = '';
      break;
    case 'CAA':
      next.flag = 0;
      next.tag = 'issue';
      break;
    default:
      break;
  }

  return next;
}

export function resetFormForType(current: RecordFormData, type: RecordType): RecordFormData {
  return applyTypeDefaults(
    {
      name: current.name,
      type,
      value: '',
      ttl: current.ttl,
    },
    type,
  );
}
