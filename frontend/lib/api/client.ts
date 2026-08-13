import { API_BASE_URL } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';
import { getAccessToken } from '@/lib/auth/token-storage';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function buildQuery(params?: Record<string, string | number | undefined | null>): string {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && auth) {
      unauthorizedHandler?.();
    }

    throw ApiError.fromResponse(response.status, responseBody);
  }

  return responseBody as T;
}

export function get<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
  options?: Omit<RequestOptions, 'method' | 'body'>,
): Promise<T> {
  return apiRequest<T>(`${path}${buildQuery(params)}`, { ...options, method: 'GET' });
}

export function post<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>,
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'POST', body });
}

export function put<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>,
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'PUT', body });
}

export function del<T>(
  path: string,
  options?: Omit<RequestOptions, 'method' | 'body'>,
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'DELETE' });
}
