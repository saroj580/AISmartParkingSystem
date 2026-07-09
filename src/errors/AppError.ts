/** Base class for all operational (expected) errors thrown across the app. */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests", retryAfterSeconds?: number) {
    super(message, 429, "TOO_MANY_REQUESTS", retryAfterSeconds ? { retryAfterSeconds } : undefined);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
  }
}

export class PaymentError extends AppError {
  constructor(message = "Payment processing failed", details?: unknown) {
    super(message, 402, "PAYMENT_ERROR", details);
  }
}
