import { NextResponse } from "next/server";
import { Prisma } from "../app/generated/prisma/client";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponseBody<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: PaginationMeta;
}

/**
 * Custom Operational Application Error
 */
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 400,
    code: string = "BAD_REQUEST",
    details?: any
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Returns a standardized Success HTTP JSON Response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200,
  pagination?: PaginationMeta
): NextResponse<ApiResponseBody<T>> {
  const body: ApiResponseBody<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(pagination && { pagination }),
  };
  return NextResponse.json(body, { status: statusCode });
}

/**
 * Returns a standardized Error HTTP JSON Response
 */
export function errorResponse(
  message: string,
  statusCode: number = 400,
  code: string = "BAD_REQUEST",
  details?: any
): NextResponse<ApiResponseBody> {
  const body: ApiResponseBody = {
    success: false,
    message,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  return NextResponse.json(body, { status: statusCode });
}

/**
 * Helper for 401 Unauthorized Response
 */
export function unauthorizedResponse(
  message: string = "غير مصرح بالوصول. يرجى تسجيل الدخول."
): NextResponse<ApiResponseBody> {
  return errorResponse(message, 401, "UNAUTHORIZED");
}

/**
 * Helper for 403 Forbidden Response
 */
export function forbiddenResponse(
  message: string = "غير مسموح لك بإجراء هذه العملية."
): NextResponse<ApiResponseBody> {
  return errorResponse(message, 403, "FORBIDDEN");
}

/**
 * Helper for 404 Not Found Response
 */
export function notFoundResponse(
  message: string = "المورد المطلوب غير موجود."
): NextResponse<ApiResponseBody> {
  return errorResponse(message, 404, "NOT_FOUND");
}

/**
 * Global API Error Handler for async route handlers
 */
export function handleApiError(error: unknown): NextResponse<ApiResponseBody> {
  console.error("[API Error Handler]:", error);

  // 1. AppError (operational error)
  if (error instanceof AppError) {
    return errorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.details
    );
  }

  // 2. Prisma Database Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique Constraint Violation
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[])?.join(", ") || "القيمة";
      return errorResponse(
        `خطأ في تكرار البيانات: ${target} مستخدم بالفعل.`,
        409,
        "DUPLICATE_ENTRY",
        error.meta
      );
    }
    // P2025: Record Not Found
    if (error.code === "P2025") {
      return errorResponse(
        "السجل المطلوب غير موجود في قاعدة البيانات.",
        404,
        "NOT_FOUND",
        error.meta
      );
    }
    // P2003: Foreign Key Constraint Failure
    if (error.code === "P2003") {
      return errorResponse(
        "فشلت العملية بسبب وجود ارتباطات بسجلات أخرى.",
        400,
        "FOREIGN_KEY_VIOLATION",
        error.meta
      );
    }
  }

  // 3. Generic Error / Fallback
  const message =
    error instanceof Error
      ? error.message
      : "حدث خطأ غير متوقع في الخادم.";

  return errorResponse(message, 500, "INTERNAL_SERVER_ERROR");
}
