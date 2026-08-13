import { DNSRecord, RecordFormData, RecordType } from '@/types/dns-record';

const IPV4_PATTERN =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

const IPV6_PATTERN =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/;

const HOSTNAME_PATTERN =
  /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\.?$/i;

export function formatRecordValue(record: DNSRecord): string {
  switch (record.type) {
    case 'MX':
      return `${record.priority ?? 0} ${record.value}`;
    case 'SRV':
      return `${record.priority ?? 0} ${record.weight ?? 0} ${record.port ?? 0} ${record.target ?? record.value}`;
    case 'CAA':
      return `${record.flag ?? 0} ${record.tag ?? 'issue'} "${record.value}"`;
    default:
      return record.value;
  }
}

export function recordFormToDNSRecord(
  form: RecordFormData,
  hostedZoneId: number,
  id?: number,
): DNSRecord {
  const base: DNSRecord = {
    id: id ?? 0,
    hostedZoneId,
    name: form.name.trim(),
    type: form.type,
    value: form.value.trim(),
    ttl: form.ttl,
  };

  switch (form.type) {
    case 'MX':
      return { ...base, priority: form.priority ?? 10 };
    case 'SRV':
      return {
        ...base,
        priority: form.priority ?? 0,
        weight: form.weight ?? 0,
        port: form.port ?? 443,
        target: form.target?.trim() || form.value.trim(),
        value: form.target?.trim() || form.value.trim(),
      };
    case 'CAA':
      return {
        ...base,
        flag: form.flag ?? 0,
        tag: form.tag?.trim() || 'issue',
      };
    default:
      return base;
  }
}

export function dnsRecordToForm(record: DNSRecord): RecordFormData {
  return {
    name: record.name,
    type: record.type,
    value: record.value,
    ttl: record.ttl,
    priority: record.priority,
    weight: record.weight,
    port: record.port,
    target: record.target,
    flag: record.flag,
    tag: record.tag,
  };
}

function isValidHostname(value: string): boolean {
  return HOSTNAME_PATTERN.test(value);
}

function validateValueField(form: RecordFormData, errors: Record<string, string>) {
  const value = form.value.trim();

  if (form.type === 'SRV') {
    return;
  }

  if (!value) {
    errors.value = `${getValueLabel(form.type)} is required`;
    return;
  }

  switch (form.type) {
    case 'A':
      if (!IPV4_PATTERN.test(value)) {
        errors.value = 'Enter a valid IPv4 address (e.g., 192.0.2.1)';
      }
      break;
    case 'AAAA':
      if (!IPV6_PATTERN.test(value)) {
        errors.value = 'Enter a valid IPv6 address';
      }
      break;
    case 'CNAME':
    case 'MX':
    case 'NS':
    case 'PTR':
      if (!isValidHostname(value)) {
        errors.value = 'Enter a valid hostname';
      }
      break;
    case 'TXT':
      if (value.length > 4096) {
        errors.value = 'TXT value must be 4096 characters or less';
      }
      break;
    default:
      break;
  }
}

function getValueLabel(type: RecordType): string {
  switch (type) {
    case 'A':
      return 'IPv4 address';
    case 'AAAA':
      return 'IPv6 address';
    case 'CNAME':
      return 'Target';
    case 'TXT':
      return 'Value';
    case 'MX':
      return 'Mail server';
    case 'NS':
      return 'Name server';
    case 'PTR':
      return 'Domain name';
    case 'CAA':
      return 'Value';
    default:
      return 'Value';
  }
}

export function validateRecordForm(form: RecordFormData, zoneName: string): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = form.name.trim();

  if (!name) {
    errors.name = 'Record name is required';
  } else if (name !== zoneName && !name.endsWith(`.${zoneName}`) && !name.endsWith('.')) {
    errors.name = `Record name must be the zone apex (${zoneName}) or a subdomain`;
  }

  if (form.ttl < 1) {
    errors.ttl = 'TTL must be at least 1 second';
  }

  if (form.type === 'MX') {
    if (form.priority === undefined || Number.isNaN(form.priority) || form.priority < 0) {
      errors.priority = 'Priority is required for MX records';
    }
  }

  if (form.type === 'SRV') {
    if (form.priority === undefined || Number.isNaN(form.priority) || form.priority < 0) {
      errors.priority = 'Priority is required for SRV records';
    }
    if (form.weight === undefined || Number.isNaN(form.weight) || form.weight < 0) {
      errors.weight = 'Weight is required for SRV records';
    }
    if (form.port === undefined || Number.isNaN(form.port) || form.port < 1) {
      errors.port = 'Port is required for SRV records';
    }
    const target = form.target?.trim();
    if (!target) {
      errors.target = 'Target is required for SRV records';
    } else if (!isValidHostname(target)) {
      errors.target = 'Enter a valid target hostname';
    }
  }

  if (form.type === 'CAA') {
    if (form.flag === undefined || Number.isNaN(form.flag) || form.flag < 0) {
      errors.flag = 'Flag is required for CAA records';
    }
    if (!form.tag?.trim()) {
      errors.tag = 'Tag is required for CAA records';
    }
  }

  validateValueField(form, errors);

  return errors;
}

export function recordTypeBadgeClass(type: RecordType): string {
  const colors: Record<RecordType, string> = {
    A: 'bg-blue-100 text-blue-800',
    AAAA: 'bg-indigo-100 text-indigo-800',
    CNAME: 'bg-purple-100 text-purple-800',
    TXT: 'bg-amber-100 text-amber-800',
    MX: 'bg-teal-100 text-teal-800',
    NS: 'bg-slate-200 text-slate-800',
    PTR: 'bg-rose-100 text-rose-800',
    SRV: 'bg-cyan-100 text-cyan-800',
    CAA: 'bg-orange-100 text-orange-800',
  };

  return colors[type];
}
