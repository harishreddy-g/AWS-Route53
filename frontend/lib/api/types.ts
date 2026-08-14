import { RecordType } from '@/types/dns-record';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserResponse {
  id: number;
  email: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  user: UserResponse;
}

export interface AuthResponse<T = UserResponse | null> {
  success: boolean;
  message: string;
  data: T;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface HostedZoneResponse {
  id: number;
  user_id: number;
  name: string;
  zone_type: 'public' | 'private';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostedZoneCreatePayload {
  name: string;
  description?: string | null;
  zone_type?: 'public' | 'private';
}

export interface HostedZoneUpdatePayload {
  name?: string;
  description?: string | null;
  zone_type?: 'public' | 'private';
}

export interface DNSRecordResponse {
  id: number;
  hosted_zone_id: number;
  name: string;
  type: RecordType;
  value: string;
  ttl: number;
  priority: number | null;
  weight: number | null;
  port: number | null;
  target: string | null;
  flag: number | null;
  tag: string | null;
  created_at: string;
  updated_at: string;
}

export interface DNSRecordCreatePayload {
  name: string;
  type: string;
  value: string;
  ttl?: number;
  priority?: number | null;
  weight?: number | null;
  port?: number | null;
  target?: string | null;
  flag?: number | null;
  tag?: string | null;
}

export type DNSRecordUpdatePayload = Partial<DNSRecordCreatePayload>;
