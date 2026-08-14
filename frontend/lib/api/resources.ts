import { del, get, post, put } from '@/lib/api/client';
import { mapPaginated, PaginatedResult } from '@/lib/api/mappers';
import { PaginatedResponse, PaginationParams } from '@/lib/api/types';

export interface CidrCollection {
  id: number; userId: number; name: string; version: number; createdAt: string; updatedAt: string;
}
interface CidrCollectionResponse {
  id: number; user_id: number; name: string; version: number; created_at: string; updated_at: string;
}
function map(r: CidrCollectionResponse): CidrCollection {
  return { id: r.id, userId: r.user_id, name: r.name, version: r.version, createdAt: r.created_at, updatedAt: r.updated_at };
}

export const cidrCollections = {
  list(params?: PaginationParams): Promise<PaginatedResult<CidrCollection>> {
    return get<PaginatedResponse<CidrCollectionResponse>>('/cidr-collections', { page: params?.page, limit: params?.limit, search: params?.search })
      .then((res) => mapPaginated(res, map));
  },
  create(input: { name: string }): Promise<CidrCollection> {
    return post<CidrCollectionResponse>('/cidr-collections', input).then(map);
  },
  update(id: number, input: { name?: string }): Promise<CidrCollection> {
    return put<CidrCollectionResponse>(`/cidr-collections/${id}`, input).then(map);
  },
  delete(id: number): Promise<void> { return del(`/cidr-collections/${id}`); },
};

export interface RegisteredDomain {
  id: number; userId: number; domainName: string; status: string; autoRenew: boolean;
  expiryDate: string; registrantName: string | null; registrantEmail: string | null;
  createdAt: string; updatedAt: string;
}
interface RegisteredDomainResponse {
  id: number; user_id: number; domain_name: string; status: string; auto_renew: boolean;
  expiry_date: string; registrant_name: string | null; registrant_email: string | null;
  created_at: string; updated_at: string;
}
function mapDomain(r: RegisteredDomainResponse): RegisteredDomain {
  return { id: r.id, userId: r.user_id, domainName: r.domain_name, status: r.status, autoRenew: r.auto_renew,
    expiryDate: r.expiry_date, registrantName: r.registrant_name, registrantEmail: r.registrant_email,
    createdAt: r.created_at, updatedAt: r.updated_at };
}

export interface RegisteredDomainCreateInput {
  domain_name: string; auto_renew?: boolean; expiry_date: string;
  registrant_name?: string | null; registrant_email?: string | null;
}

export const registeredDomains = {
  list(params?: PaginationParams): Promise<PaginatedResult<RegisteredDomain>> {
    return get<PaginatedResponse<RegisteredDomainResponse>>('/registered-domains', { page: params?.page, limit: params?.limit, search: params?.search })
      .then((res) => mapPaginated(res, mapDomain));
  },
  create(input: RegisteredDomainCreateInput): Promise<RegisteredDomain> {
    return post<RegisteredDomainResponse>('/registered-domains', input).then(mapDomain);
  },
  update(id: number, input: Partial<RegisteredDomainCreateInput & { status: string }>): Promise<RegisteredDomain> {
    return put<RegisteredDomainResponse>(`/registered-domains/${id}`, input).then(mapDomain);
  },
  delete(id: number): Promise<void> { return del(`/registered-domains/${id}`); },
};

export interface Vpc {
  id: number; userId: number; vpcId: string; region: string; cidrBlock: string;
  description: string | null; createdAt: string; updatedAt: string;
}
interface VpcResponse {
  id: number; user_id: number; vpc_id: string; region: string; cidr_block: string;
  description: string | null; created_at: string; updated_at: string;
}
function mapVpc(r: VpcResponse): Vpc {
  return { id: r.id, userId: r.user_id, vpcId: r.vpc_id, region: r.region, cidrBlock: r.cidr_block,
    description: r.description, createdAt: r.created_at, updatedAt: r.updated_at };
}

export interface VpcCreateInput { vpc_id: string; region: string; cidr_block: string; description?: string | null; }

export const vpcs = {
  list(params?: PaginationParams): Promise<PaginatedResult<Vpc>> {
    return get<PaginatedResponse<VpcResponse>>('/vpcs', { page: params?.page, limit: params?.limit, search: params?.search })
      .then((res) => mapPaginated(res, mapVpc));
  },
  create(input: VpcCreateInput): Promise<Vpc> {
    return post<VpcResponse>('/vpcs', input).then(mapVpc);
  },
  update(id: number, input: Partial<VpcCreateInput>): Promise<Vpc> {
    return put<VpcResponse>(`/vpcs/${id}`, input).then(mapVpc);
  },
  delete(id: number): Promise<void> { return del(`/vpcs/${id}`); },
};
