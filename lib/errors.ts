/**
 * Production-grade error handling for the multi-tenant API
 */

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }

  toResponse(): ApiErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details })
      }
    }
  }
}

// Common error factory functions
export const errors = {
  unauthorized: (message = 'Authentication required') =>
    new ApiError(401, 'UNAUTHORIZED', message),

  forbidden: (message = 'Access denied') =>
    new ApiError(403, 'FORBIDDEN', message),

  notFound: (message = 'Resource not found') =>
    new ApiError(404, 'NOT_FOUND', message),

  conflict: (message = 'Resource already exists') =>
    new ApiError(409, 'CONFLICT', message),

  validation: (message: string, details?: any) =>
    new ApiError(400, 'VALIDATION_ERROR', message, details),

  tenantViolation: (message = 'Cannot access data from other tenant') =>
    new ApiError(403, 'TENANT_VIOLATION', message),

  internal: (message = 'Internal server error') =>
    new ApiError(500, 'INTERNAL_ERROR', message),

  notImplemented: (message = 'Not implemented') =>
    new ApiError(501, 'NOT_IMPLEMENTED', message)
}

/**
 * Handle API errors and return consistent response
 */
export function handleApiError(error: any): Response {
  if (error instanceof ApiError) {
    return Response.json(error.toResponse(), { status: error.statusCode })
  }

  // Log unexpected errors
  console.error('[API_ERROR]', error)

  const internalError = errors.internal(
    process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
  )

  return Response.json(internalError.toResponse(), { status: 500 })
}

/**
 * Wrap async API route handlers with error handling
 */
export function asyncHandler(
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
