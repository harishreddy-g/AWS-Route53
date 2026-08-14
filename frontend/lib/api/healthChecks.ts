import { del, get, post, put } from '@/lib/api/client';
import { mapPaginated, PaginatedResult } from '@/lib/api/mappers';
import { PaginatedResponse, PaginationParams } from '@/lib/api/types';

export interface HealthCheck {
  id: number;
  userId: number;
  name: string;
  protocol: 'HTTP' | 'HTTPS' | 'TCP';
  domainName: string | null;
  ipAddress: string | null;
  port: number | null;
  resourcePath: string;
  requestInterval: number;
  failureThreshold: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface HealthCheckResponse {
  id: number;
  user_id: number;
  name: string;
  protocol: 'HTTP' | 'HTTPS' | 'TCP';
  domain_name: string | null;
  ip_address: string | null;
  port: number | null;
  resource_path: string;
  request_interval: number;
  failure_threshold: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HealthCheckCreateInput {
  name: string;
  protocol: 'HTTP' | 'HTTPS' | 'TCP';
  domain_name?: string | null;
  ip_address?: string | null;
  port?: number | null;
  resource_path?: string;
  request_interval?: number;
  failure_threshold?: number;
}

export interface HealthCheckUpdateInput extends Partial<HealthCheckCreateInput> {}

function mapHealthCheck(r: HealthCheckResponse): HealthCheck {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    protocol: r.protocol,
    domainName: r.domain_name,
    ipAddress: r.ip_address,
    port: r.port,
    resourcePath: r.resource_path,
    requestInterval: r.request_interval,
    failureThreshold: r.failure_threshold,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export const healthChecks = {
  list(params?: PaginationParams): Promise<PaginatedResult<HealthCheck>> {
    return get<PaginatedResponse<HealthCheckResponse>>('/health-checks', {
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
    }).then((res) => mapPaginated(res, mapHealthCheck));
  },

  get(id: number): Promise<HealthCheck> {
    return get<HealthCheckResponse>(`/health-checks/${id}`).then(mapHealthCheck);
  },

  create(input: HealthCheckCreateInput): Promise<HealthCheck> {
    return post<HealthCheckResponse>('/health-checks', input).then(mapHealthCheck);
  },

  update(id: number, input: HealthCheckUpdateInput): Promise<HealthCheck> {
    return put<HealthCheckResponse>(`/health-checks/${id}`, input).then(mapHealthCheck);
  },

  delete(id: number): Promise<void> {
    return del(`/health-checks/${id}`);
  },
};
