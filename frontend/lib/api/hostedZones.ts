import { del, get, post, put } from '@/lib/api/client';
import { mapHostedZone, mapPaginated, PaginatedResult } from '@/lib/api/mappers';
import {
  HostedZoneCreatePayload,
  HostedZoneResponse,
  HostedZoneUpdatePayload,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/api/types';
import { HostedZone } from '@/types/hosted-zone';

export type HostedZoneListParams = PaginationParams;

export type CreateHostedZoneInput = HostedZoneCreatePayload;
export type UpdateHostedZoneInput = HostedZoneUpdatePayload;

export const hostedZones = {
  list(params?: HostedZoneListParams): Promise<PaginatedResult<HostedZone>> {
    return get<PaginatedResponse<HostedZoneResponse>>('/hosted-zones', {
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
    }).then((response) => mapPaginated(response, mapHostedZone));
  },

  get(zoneId: number): Promise<HostedZone> {
    return get<HostedZoneResponse>(`/hosted-zones/${zoneId}`).then(mapHostedZone);
  },

  create(input: CreateHostedZoneInput): Promise<HostedZone> {
    return post<HostedZoneResponse>('/hosted-zones', {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      zone_type: input.zone_type ?? 'public',
    }).then(mapHostedZone);
  },

  update(zoneId: number, input: UpdateHostedZoneInput): Promise<HostedZone> {
    return put<HostedZoneResponse>(`/hosted-zones/${zoneId}`, {
      name: input.name?.trim(),
      description: input.description?.trim() || null,
      zone_type: input.zone_type,
    }).then(mapHostedZone);
  },

  delete(zoneId: number): Promise<void> {
    return del(`/hosted-zones/${zoneId}`);
  },
};
