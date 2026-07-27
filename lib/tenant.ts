import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { AppError } from "./api-response";

/**
 * Extract tenant ID from request headers (populated by Next.js middleware)
 */
export function getTenantIdFromRequest(
  request: Request | NextRequest | Headers
): string | null {
  if (request instanceof Headers) {
    return request.get("x-tenant-id");
  }
  if ("headers" in request) {
    return request.headers.get("x-tenant-id");
  }
  return null;
}

/**
 * Require tenant ID from request, throwing AppError if missing
 */
export function requireTenantId(
  request: Request | NextRequest | Headers
): string {
  const tenantId = getTenantIdFromRequest(request);
  if (!tenantId) {
    throw new AppError("سياق المؤسسة مطلوب لهذه العملية (Missing Tenant Context)", 400);
  }
  return tenantId;
}

/**
 * Helper to build tenant-scoped database query objects
 */
export function withTenant<T extends object>(tenantId: string, queryObj: T = {} as T): T & { tenant_id: string } {
  return {
    ...queryObj,
    tenant_id: tenantId,
  };
}

/**
 * Create a tenant-scoped Prisma client extension
 */
export function getTenantPrisma(tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenant_id: tenantId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenant_id: tenantId };
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenant_id: tenantId };
          }
          return query(args);
        },
        async create({ model, args, query }) {
          if (isTenantModel(model)) {
            args.data = { ...(args.data as Record<string, unknown>), tenant_id: tenantId } as any;
          }
          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenant_id: tenantId };
          }
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenant_id: tenantId };
          }
          return query(args);
        },
      },
    },
  });
}

/**
 * List of models strictly bound to a tenant
 */
function isTenantModel(model: string): boolean {
  const tenantModels = [
    "User",
    "UserRoles",
    "Passenger",
    "Vehicle",
    "Driver",
    "Form",
    "FormResponse",
  ];
  return tenantModels.includes(model);
}
