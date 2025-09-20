import { NextResponse, type NextRequest } from "next/server";

export class AppError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
  constructor(
    message: string,
    opts?: { code?: string; status?: number; details?: unknown }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = opts?.code;
    this.status = opts?.status;
    this.details = opts?.details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, { code: "VALIDATION_ERROR", status: 400, details });
  }
}
export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, { code: "UNAUTHORIZED", status: 401 });
  }
}
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, { code: "FORBIDDEN", status: 403 });
  }
}
export class RateLimitError extends AppError {
  constructor(retryAfterMs?: number) {
    super("Rate limit exceeded", {
      code: "RATE_LIMITED",
      status: 429,
      details: { retryAfterMs },
    });
  }
}
export class ProviderError extends AppError {
  constructor(message = "Upstream provider failed") {
    super(message, { code: "PROVIDER_ERROR", status: 502 });
  }
}

export function mapErrorToHttp(err: unknown): {
  status: number;
  body: Record<string, unknown>;
} {
  if (err instanceof AppError) {
    return {
      status: err.status ?? 500,
      body: {
        error: true,
        code: err.code ?? "APP_ERROR",
        message: err.message,
        details: err.details,
      },
    };
  }
  const message = err instanceof Error ? err.message : "Internal Server Error";
  return {
    status: 500,
    body: { error: true, code: "INTERNAL_ERROR", message },
  };
}

export function withApiHandler<
  T extends (req: NextRequest) => Promise<NextResponse>
>(handler: T) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (e) {
      const mapped = mapErrorToHttp(e);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
  };
}
