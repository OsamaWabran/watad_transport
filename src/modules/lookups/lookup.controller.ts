import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-response";
import { getTenantIdFromAuth, isSuperAdminRequest } from "@/lib/tenant";
import { LookupService } from "./lookup.service";

export class LookupController {
  // Types
  static async listTypes(request: NextRequest) {
    try {
      const tenant_id = (await getTenantIdFromAuth(request)) || request.nextUrl.searchParams.get("tenant_id");
      const isSuperAdmin = await isSuperAdminRequest(request);
      const types = await LookupService.getLookupTypes({
        tenant_id,
        includeAllTenants: isSuperAdmin,
      });
      return successResponse(types, "تم جلب فئات البيانات المرجعية بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getTypeById(request: NextRequest, id: string) {
    try {
      const tenant_id = (await getTenantIdFromAuth(request)) || request.nextUrl.searchParams.get("tenant_id");
      const isSuperAdmin = await isSuperAdminRequest(request);
      const type = await LookupService.getLookupTypeById(id, {
        tenant_id,
        includeAllTenants: isSuperAdmin,
      });
      return successResponse(type, "تم جلب الفئة المرجعية بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async createType(request: NextRequest) {
    try {
      const body = await request.json();
      const authTenantId = await getTenantIdFromAuth(request);
      const isSuperAdmin = await isSuperAdminRequest(request);
      const tenant_id = isSuperAdmin ? body.tenant_id ?? null : authTenantId || body.tenant_id;
      const type = await LookupService.createLookupType({
        ...body,
        tenant_id,
      });
      return successResponse(type, "تم إنشاء فئة البيانات المرجعية بنجاح", 201);
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updateType(request: NextRequest, id: string) {
    try {
      const body = await request.json();
      const authTenantId = await getTenantIdFromAuth(request);
      const isSuperAdmin = await isSuperAdminRequest(request);
      const tenant_id = isSuperAdmin ? body.tenant_id ?? null : authTenantId || body.tenant_id;
      const type = await LookupService.updateLookupType(id, tenant_id, body);
      return successResponse(type, "تم تحديث الفئة المرجعية بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteType(request: NextRequest, id: string) {
    try {
      const body = await request.json().catch(() => ({}));
      const authTenantId = await getTenantIdFromAuth(request);
      const isSuperAdmin = await isSuperAdminRequest(request);
      const requestedTenantId = body.tenant_id ?? request.nextUrl.searchParams.get("tenant_id");
      const tenant_id = isSuperAdmin ? requestedTenantId ?? null : authTenantId || requestedTenantId;
      const type = await LookupService.deleteLookupType(id, tenant_id);
      return successResponse(type, "تم حذف الفئة المرجعية بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Values
  static async listValues(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const category_id = searchParams.get("category_id");
      const parent_value_id = searchParams.has("parent_value_id")
        ? searchParams.get("parent_value_id")
        : undefined;
      const tenant_id = (await getTenantIdFromAuth(request)) || searchParams.get("tenant_id");
      const isSuperAdmin = await isSuperAdminRequest(request);
      const scope = {
        tenant_id,
        includeAllTenants: isSuperAdmin,
      };

      if (!category_id) {
        const types = await LookupService.getLookupTypes(scope);
        const allValues = types.flatMap((t) => t.lookup_values);
        return successResponse(allValues, "تم جلب جميع القيم المرجعية بنجاح");
      }

      const values = await LookupService.getLookupValuesByCategory(category_id, scope, parent_value_id);
      return successResponse(values, "تم جلب القيم المرجعية بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async createValue(request: NextRequest) {
    try {
      const body = await request.json();
      const authTenantId = await getTenantIdFromAuth(request);
      const isSuperAdmin = await isSuperAdminRequest(request);
      const tenant_id = isSuperAdmin ? body.tenant_id ?? null : authTenantId || body.tenant_id;
      const value = await LookupService.createLookupValue({
        ...body,
        tenant_id,
      });
      return successResponse(value, "تم إنشاء القيمة المرجعية بنجاح", 201);
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updateValue(request: NextRequest, id: string) {
    try {
      const body = await request.json();
      const authTenantId = await getTenantIdFromAuth(request);
      const isSuperAdmin = await isSuperAdminRequest(request);
      const tenant_id = isSuperAdmin ? body.tenant_id ?? null : authTenantId || body.tenant_id;
      const value = await LookupService.updateLookupValue(id, tenant_id, body);
      return successResponse(value, "تم تحديث القيمة المرجعية بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteValue(request: NextRequest, id: string) {
    try {
      const body = await request.json().catch(() => ({}));
      const authTenantId = await getTenantIdFromAuth(request);
      const isSuperAdmin = await isSuperAdminRequest(request);
      const requestedTenantId = body.tenant_id ?? request.nextUrl.searchParams.get("tenant_id");
      const tenant_id = isSuperAdmin ? requestedTenantId ?? null : authTenantId || requestedTenantId;
      const value = await LookupService.deleteLookupValue(id, tenant_id);
      return successResponse(value, "تم حذف القيمة المرجعية بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }
}
