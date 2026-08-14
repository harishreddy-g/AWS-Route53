export { auth } from '@/lib/api/auth';
export { hostedZones } from '@/lib/api/hostedZones';
export { dnsRecords } from '@/lib/api/dnsRecords';
export { healthChecks } from '@/lib/api/healthChecks';
export { trafficPolicies } from '@/lib/api/trafficPolicies';
export { cidrCollections, registeredDomains, vpcs } from '@/lib/api/resources';
export { setUnauthorizedHandler } from '@/lib/api/client';
export { getErrorMessage } from '@/lib/api/errors';

export type { PaginatedResult } from '@/lib/api/mappers';
export type { HostedZoneListParams, CreateHostedZoneInput, UpdateHostedZoneInput } from '@/lib/api/hostedZones';
export type { DNSRecordListParams } from '@/lib/api/dnsRecords';
export type { HealthCheck, HealthCheckCreateInput } from '@/lib/api/healthChecks';
export type { TrafficPolicy, TrafficPolicyCreateInput, RoutingType } from '@/lib/api/trafficPolicies';
export type { CidrCollection, RegisteredDomain, RegisteredDomainCreateInput, Vpc, VpcCreateInput } from '@/lib/api/resources';
