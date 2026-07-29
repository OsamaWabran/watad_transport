import { NextRequest } from "next/server";
import { AuthService } from "./auth.service";
import { successResponse, handleApiError, AppError } from "@/lib/api-response";
import { getTenantIdFromRequest, requireTenantId } from "@/lib/tenant";

export class AuthController {
  /**
   * POST /api/v1/auth/login
   */
  static async login(request: NextRequest) {
    try {
      const body = await request.json();
      const userResponse = await AuthService.loginUser(body);
      return successResponse(userResponse, "تم تسجيل الدخول بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST /api/v1/users
   */
  static async createUser(request: NextRequest) {
    try {
      const body = await request.json();
      const headerTenantId = getTenantIdFromRequest(request);

      const isValidUuid = (id: any) => typeof id === "string" && id.trim().length === 36;

      let tenantId: string | null = null;
      if (isValidUuid(body.tenant_id)) {
        tenantId = body.tenant_id.trim();
      } else if (isValidUuid(headerTenantId)) {
        tenantId = headerTenantId;
      }

      if (!tenantId) {
        throw new AppError("سياق المؤسسة (tenant_id) مطلوب لإضافة المستخدم", 400);
      }

      const userResponse = await AuthService.registerUser({
        ...body,
        tenant_id: tenantId,
      });

      return successResponse(userResponse, "تم إضافة المستخدم بنجاح", 201);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET /api/v1/users
   */
  static async listUsers(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const queryTenantId = url.searchParams.get("tenant_id");
      const rolesHeader = request.headers.get("x-user-roles");

      let isSuperAdmin = false;
      if (rolesHeader) {
        try {
          const roles = JSON.parse(rolesHeader);
          if (Array.isArray(roles) && roles.includes("super_admin")) {
            isSuperAdmin = true;
          }
        } catch {}
      }

      const isValidUuid = (id: any) => typeof id === "string" && id.trim().length === 36;

      let targetTenantId: string | undefined = undefined;

      if (queryTenantId && isValidUuid(queryTenantId)) {
        targetTenantId = queryTenantId.trim();
      } else if (!isSuperAdmin) {
        const headerTenantId = getTenantIdFromRequest(request);
        if (isValidUuid(headerTenantId)) {
          targetTenantId = headerTenantId!;
        }
      }

      const users = await AuthService.getUsersByTenant(targetTenantId);
      return successResponse(users, "تم جلب قائمة المستخدمين بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST /api/v1/users/[id]/roles
   */
  static async assignRole(request: NextRequest, userId: string) {
    try {
      const tenantId = requireTenantId(request);
      const body = await request.json();
      const { role } = body;

      const userResponse = await AuthService.assignRole(userId, tenantId, role);
      return successResponse(userResponse, "تم تعيين الصلاحية للمستخدم بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT /api/v1/users/[id]
   */
  static async updateUser(request: NextRequest, userId: string) {
    try {
      const body = await request.json();
      const tenantId = body.tenant_id || getTenantIdFromRequest(request);
      if (!tenantId) throw new Error("سياق المؤسسة مطلوب");

      const updated = await AuthService.updateUser(userId, tenantId, body);
      return successResponse(updated, "تم تحديث بيانات المستخدم بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE /api/v1/users/[id]
   */
  static async deleteUser(request: NextRequest, userId: string) {
    try {
      const body = await request.json().catch(() => ({}));
      const tenantId = body.tenant_id || getTenantIdFromRequest(request);
      if (!tenantId) throw new Error("سياق المؤسسة مطلوب");

      await AuthService.deleteUser(userId, tenantId);
      return successResponse(null, "تم حذف المستخدم بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }
}
