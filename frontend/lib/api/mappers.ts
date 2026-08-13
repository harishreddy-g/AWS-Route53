import { DNSRecord, RecordFormData, RecordType } from '@/types/dns-record';
import { HostedZone } from '@/types/hosted-zone';
import {
  DNSRecordCreatePayload,
  DNSRecordResponse,
  DNSRecordUpdatePayload,
  HostedZoneResponse,
  PaginatedResponse,
} from '@/lib/api/types';

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function mapHostedZone(zone: HostedZoneResponse, recordCount?: number): HostedZone {
  return {
    id: zone.id,
    userId: zone.user_id,
    name: zone.name,
    description: zone.description,
    createdAt: zone.created_at,
    updatedAt: zone.updated_at,
    recordCount,
  };
}

export function mapDnsRecord(record: DNSRecordResponse): DNSRecord {
  return {
    id: record.id,
    hostedZoneId: record.hosted_zone_id,
    name: record.name,
    type: record.type as RecordType,
    value: record.value,
    ttl: record.ttl,
    priority: record.priority ?? undefined,
    weight: record.weight ?? undefined,
    port: record.port ?? undefined,
    target: record.target ?? undefined,
    flag: record.flag ?? undefined,
    tag: record.tag ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapPaginated<TSource, TTarget>(
  response: PaginatedResponse<TSource>,
  mapper: (item: TSource) => TTarget,
): PaginatedResult<TTarget> {
  return {
    items: response.items.map(mapper),
    page: response.page,
    limit: response.limit,
    total: response.total,
    totalPages: response.total_pages,
  };
}

export function formToCreatePayload(form: RecordFormData): DNSRecordCreatePayload {
  const payload: DNSRecordCreatePayload = {
    name: form.name.trim(),
    type: form.type,
    value: form.type === 'SRV' ? form.target?.trim() || form.value.trim() : form.value.trim(),
    ttl: form.ttl,
  };

  if (form.type === 'MX' || form.type === 'SRV') {
    payload.priority = form.priority ?? null;
  }

  if (form.type === 'SRV') {
    payload.weight = form.weight ?? null;
    payload.port = form.port ?? null;
    payload.target = form.target?.trim() || null;
  }

  if (form.type === 'CAA') {
    payload.flag = form.flag ?? null;
    payload.tag = form.tag?.trim() || null;
  }

  return payload;
}

export function formToUpdatePayload(form: RecordFormData): DNSRecordUpdatePayload {
  return formToCreatePayload(form);
}
