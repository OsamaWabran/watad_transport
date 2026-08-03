import { NextRequest } from "next/server";
import { AppError, handleApiError, successResponse } from "@/lib/api-response";
import { getTenantIdFromAuth, getTenantIdFromRequest } from "@/lib/tenant";
import { FormService } from "./form.service";

export class FormController {
  static async listForms(request: NextRequest) {
    try {
      const tenant_id = await this.resolveTenantId(
        request,
        request.nextUrl.searchParams.get("tenant_id") || undefined
      );
      const forms = await FormService.getForms(tenant_id);
      return successResponse(forms, "تم جلب النماذج بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getFormById(request: NextRequest, id: string) {
    try {
      const tenant_id = getTenantIdFromRequest(request) || request.nextUrl.searchParams.get("tenant_id") || undefined;
      const form = await FormService.getFormById(id, tenant_id);
      return successResponse(form, "تم جلب بيانات النموذج بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async createForm(request: NextRequest) {
    try {
      const body = await request.json();
      const tenant_id = await this.resolveTenantId(request, body.tenant_id);
      const form = await FormService.createForm({
        ...body,
        tenant_id,
      });
      return successResponse(form, "تم إنشاء النموذج بنجاح", 201);
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updateForm(request: NextRequest, id: string) {
    try {
      const body = await request.json();
      const tenant_id = await this.resolveTenantId(request, body.tenant_id);
      const form = await FormService.updateForm(id, tenant_id, body);
      return successResponse(form, "تم تحديث النموذج بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteForm(request: NextRequest, id: string) {
    try {
      const body = await request.json().catch(() => ({}));
      const tenant_id = await this.resolveTenantId(
        request,
        body.tenant_id || request.nextUrl.searchParams.get("tenant_id") || undefined
      );
      const form = await FormService.deleteForm(id, tenant_id);
      return successResponse(form, "تم حذف النموذج بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Submit form endpoint (public or authenticated)
  static async submitForm(request: NextRequest, id: string) {
    try {
      const body = await request.json();
      const result = await FormService.submitForm(id, body);
      return successResponse(result, "تم تسليم النموذج بنجاح", 201);
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async submitPublicForm(request: NextRequest) {
    try {
      const body = await request.json();
      let form_id = body.form_id;
      if (body.form_hash) {
        const form = await import("@/src/modules/forms/form.model").then(m => m.FormModel.findByHash(body.form_hash));
        if (!form) throw new AppError("النموذج غير موجود أو الرابط منتهي", 404);
        form_id = form.id;
      }
      if (!form_id) throw new AppError("معرف النموذج أو الرابط مطلوب", 400);

      const result = await FormService.submitForm(form_id, body);
      return successResponse(result, "تم تسليم النموذج بنجاح", 201);
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Get Form Responses endpoint
  static async getResponses(request: NextRequest, id: string) {
    try {
      const tenant_id = getTenantIdFromRequest(request) || request.nextUrl.searchParams.get("tenant_id") || undefined;
      const responses = await FormService.getFormResponses(id, tenant_id);
      return successResponse(responses, "تم جلب استجابات النموذج بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  private static async resolveTenantId(request: NextRequest, fallback?: string): Promise<string> {
    const tenantId = (await getTenantIdFromAuth(request)) || fallback;
    if (!tenantId) {
      throw new AppError("سياق المؤسسة مطلوب لهذه العملية", 400);
    }
    return tenantId;
  }
}
