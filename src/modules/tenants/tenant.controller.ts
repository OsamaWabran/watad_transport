import { NextRequest } from "next/server";
import { TenantService } from "./tenant.service";
import { successResponse, handleApiError, AppError } from "@/lib/api-response";
import { TenantType } from "@/app/generated/prisma/client";

export class TenantController {
  /**
   * GET /api/v1/tenants
   */
  static async listTenants(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const isActiveParam = searchParams.get("is_active");
      const typeParam = searchParams.get("type") as TenantType | null;
      const search = searchParams.get("search") || undefined;

      const is_active =
        isActiveParam !== null ? isActiveParam === "true" : undefined;

      const tenants = await TenantService.getAllTenants({
        is_active,
        type: typeParam || undefined,
        search,
      });

      return successResponse(tenants, "تم جلب قائمة المؤسسات بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST /api/v1/tenants
   */
  static async createTenant(request: NextRequest) {
    try {
      const body = await request.json();
      const tenant = await TenantService.registerTenant(body);
      return successResponse(tenant, "تم تسجيل المؤسسة بنجاح", 201);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET /api/v1/tenants/[id]
   */
  static async getTenantById(_request: NextRequest, id: string) {
    try {
      const tenant = await TenantService.getTenantById(id);
      return successResponse(tenant, "تم جلب بيانات المؤسسة بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PATCH /api/v1/tenants/[id]/activate
   */
  static async activateTenant(request: NextRequest, id: string) {
    try {
      const body = await request.json().catch(() => ({}));
      const is_active = body.is_active !== undefined ? Boolean(body.is_active) : true;
      const tenant = await TenantService.toggleTenantStatus(id, is_active);
      const msg = is_active ? "تم تفعيل المؤسسة بنجاح" : "تم إلغاء تفعيل المؤسسة بنجاح";
      return successResponse(tenant, msg);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PATCH /api/v1/tenants/[id]
   */
  static async updateTenant(request: NextRequest, id: string) {
    try {
      const body = await request.json();
      const tenant = await TenantService.updateTenant(id, body);
      return successResponse(tenant, "تم تحديث بيانات المؤسسة بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE /api/v1/tenants/[id]
   */
  static async deleteTenant(_request: NextRequest, id: string) {
    try {
      const tenant = await TenantService.deleteTenant(id);
      return successResponse(tenant, "تم حذف المؤسسة بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }
}
