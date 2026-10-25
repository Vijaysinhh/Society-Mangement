import { NextResponse } from 'next/server'
import { ApiResponse } from './types'

export function success<T>(data: T, statusCode = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      statusCode,
    },
    { status: statusCode }
  )
}

export function error(message: string, statusCode = 400): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode,
    },
    { status: statusCode }
  )
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return success(data, 201)
}

export function notFound(message = 'Resource not found'): NextResponse<ApiResponse<null>> {
  return error(message, 404)
}

export function unauthorized(message = 'Unauthorized'): NextResponse<ApiResponse<null>> {
  return error(message, 401)
}

export function conflict(message: string): NextResponse<ApiResponse<null>> {
  return error(message, 409)
}

export function serverError(message = 'Internal server error'): NextResponse<ApiResponse<null>> {
  return error(message, 500)
}
