import { del, get, post, put } from '@/lib/api/client';
import { mapPaginated, PaginatedResult } from '@/lib/api/mappers';
import { PaginatedResponse, PaginationParams } from '@/lib/api/types';

export type RoutingType = 'Simple' | 'Weighted' | 'Latency' | 'Failover' | 'Geolocation' | 'Multivalue' | 'IP-based';

export interface TrafficPolicy {
  id: number;
  userId: number;
  name: string;
  routingType: RoutingType;
  comment: string | null;
  document: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface TrafficPolicyResponse {
  id: number; user_id: number; name: string; routing_type: string;
  comment: string | null; document: string; version: number;
  created_at: string; updated_at: string;
}

export interface TrafficPolicyCreateInput {
  name: string; routing_type: RoutingType; comment?: string | null; document: string;
}
export interface TrafficPolicyUpdateInput extends Partial<TrafficPolicyCreateInput> {}

function mapTrafficPolicy(r: TrafficPolicyResponse): TrafficPolicy {
  return { id: r.id, userId: r.user_id, name: r.name, routingType: r.routing_type as RoutingType,
    comment: r.comment, document: r.document, version: r.version, createdAt: r.created_at, updatedAt: r.updated_at };
}

export const trafficPolicies = {
  list(params?: PaginationParams): Promise<PaginatedResult<TrafficPolicy>> {
    return get<PaginatedResponse<TrafficPolicyResponse>>('/traffic-policies', { page: params?.page, limit: params?.limit, search: params?.search })
      .then((res) => mapPaginated(res, mapTrafficPolicy));
  },
  get(id: number): Promise<TrafficPolicy> {
    return get<TrafficPolicyResponse>(`/traffic-policies/${id}`).then(mapTrafficPolicy);
  },
  create(input: TrafficPolicyCreateInput): Promise<TrafficPolicy> {
    return post<TrafficPolicyResponse>('/traffic-policies', input).then(mapTrafficPolicy);
  },
  update(id: number, input: TrafficPolicyUpdateInput): Promise<TrafficPolicy> {
    return put<TrafficPolicyResponse>(`/traffic-policies/${id}`, input).then(mapTrafficPolicy);
  },
  delete(id: number): Promise<void> { return del(`/traffic-policies/${id}`); },
};
