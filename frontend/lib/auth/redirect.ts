const DEFAULT_REDIRECT = '/dashboard';

/**
 * Returns a safe in-app path from the `next` query param, or the dashboard.
 */
export function getPostLoginRedirect(next: string | null): string {
  if (!next) {
    return DEFAULT_REDIRECT;
  }

  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/login')) {
    return DEFAULT_REDIRECT;
  }

  return next;
}
