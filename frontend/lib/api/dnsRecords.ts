import { del, get, post, put } from '@/lib/api/client';
import { formToCreatePayload, formToUpdatePayload, mapDnsRecord, mapPaginated, PaginatedResult } from '@/lib/api/mappers';
import { DNSRecordResponse, PaginatedResponse, PaginationParams } from '@/lib/api/types';
import { DNSRecord, RecordFormData } from '@/types/dns-record';

export interface DNSRecordListParams extends PaginationParams {
  type?: string;
}

export const dnsRecords = {
  list(zoneId: number, params?: DNSRecordListParams): Promise<PaginatedResult<DNSRecord>> {
    return get<PaginatedResponse<DNSRecordResponse>>(`/hosted-zones/${zoneId}/records`, {
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      type: params?.type,
    }).then((response) => mapPaginated(response, mapDnsRecord));
  },

  get(zoneId: number, recordId: number): Promise<DNSRecord> {
    return get<DNSRecordResponse>(`/hosted-zones/${zoneId}/records/${recordId}`).then(mapDnsRecord);
  },

  create(zoneId: number, form: RecordFormData): Promise<DNSRecord> {
    return post<DNSRecordResponse>(`/hosted-zones/${zoneId}/records`, formToCreatePayload(form)).then(mapDnsRecord);
  },

  update(zoneId: number, recordId: number, form: RecordFormData): Promise<DNSRecord> {
    return put<DNSRecordResponse>(`/hosted-zones/${zoneId}/records/${recordId}`, formToUpdatePayload(form)).then(
      mapDnsRecord,
    );
  },

  delete(zoneId: number, recordId: number): Promise<void> {
    return del(`/hosted-zones/${zoneId}/records/${recordId}`);
  },
};
