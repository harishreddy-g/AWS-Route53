import { AUTH_TOKEN_KEY } from '@/lib/api/config';

const AUTH_COOKIE = 'route53_auth';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function setAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  setAuthCookie();
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  clearAuthCookie();
}

export function syncAuthCookie(): void {
  if (getAccessToken()) {
    setAuthCookie();
  }
}
