export { auth } from '@/lib/api/auth';
export { hostedZones } from '@/lib/api/hostedZones';
export { dnsRecords } from '@/lib/api/dnsRecords';
export { setUnauthorizedHandler } from '@/lib/api/client';
export { getErrorMessage } from '@/lib/api/errors';

export type { PaginatedResult } from '@/lib/api/mappers';
export type { HostedZoneListParams, CreateHostedZoneInput, UpdateHostedZoneInput } from '@/lib/api/hostedZones';
export type { DNSRecordListParams } from '@/lib/api/dnsRecords';
