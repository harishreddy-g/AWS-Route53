export type ApiValidationErrorItem = {
  type: string;
  loc: (string | number)[];
  msg: string;
  input?: unknown;
};

export class ApiError extends Error {
  status: number;
  detail: string | ApiValidationErrorItem[];

  constructor(status: number, detail: string | ApiValidationErrorItem[], message?: string) {
    super(message ?? ApiError.formatDetail(detail));
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }

  static formatDetail(detail: string | ApiValidationErrorItem[]): string {
    if (typeof detail === 'string') {
      return detail;
    }

    if (detail.length === 0) {
      return 'Request failed';
    }

    return detail.map((item) => item.msg).join(', ');
  }

  static fromResponse(status: number, body: unknown): ApiError {
    if (body && typeof body === 'object' && 'detail' in body) {
      const detail = (body as { detail: string | ApiValidationErrorItem[] }).detail;
      return new ApiError(status, detail);
    }

    return new ApiError(status, 'Request failed');
  }
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
