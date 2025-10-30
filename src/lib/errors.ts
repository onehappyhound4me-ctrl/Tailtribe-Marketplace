export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string

  constructor(message: string, statusCode: number = 500, code?: string, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, 402, 'PAYMENT_ERROR')
    this.name = 'PaymentError'
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // Handle Prisma errors
    if (error.message.includes('Unique constraint')) {
      return new ConflictError('Resource already exists')
    }

    if (error.message.includes('Foreign key constraint')) {
      return new ValidationError('Invalid reference')
    }

    if (error.message.includes('Record to update not found')) {
      return new NotFoundError()
    }

    // Handle Stripe errors
    if (error.message.includes('stripe')) {
      return new PaymentError(error.message)
    }

    return new AppError(error.message)
  }

  return new AppError('An unexpected error occurred')
}

export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

