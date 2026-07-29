import { NextRequest } from "next/server";
import { Gender } from "@/app/generated/prisma/client";
import { AppError, handleApiError, successResponse } from "@/lib/api-response";
import { getTenantIdFromRequest } from "@/lib/tenant";
import { PassengerService } from "./passenger.service";

export class PassengerController {
  /**
   * GET /api/v1/passengers
   */
  static async listPassengers(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const tenant_id = this.resolveTenantId(
        request,
        searchParams.get("tenant_id") || undefined
      );
      const gender = searchParams.get("gender") as Gender | null;
      const search = searchParams.get("search") || undefined;

      const passengers = await PassengerService.getPassengers({
        tenant_id,
        gender: gender || undefined,
        search,
      });

      return successResponse(passengers, "تم جلب قائمة الركاب بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST /api/v1/passengers
   */
  static async createPassenger(request: NextRequest) {
    try {
      const body = await request.json();
      const tenant_id = this.resolveTenantId(request, body.tenant_id);
      const passenger = await PassengerService.createPassenger({
        ...body,
        tenant_id,
      });
      return successResponse(passenger, "تم تسجيل الراكب بنجاح", 201);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET /api/v1/passengers/[id]
   */
  static async getPassengerById(request: NextRequest, id: string) {
    try {
      const tenant_id = this.resolveTenantId(
        request,
        request.nextUrl.searchParams.get("tenant_id") || undefined
      );
      const passenger = await PassengerService.getPassengerById(tenant_id, id);
      return successResponse(passenger, "تم جلب بيانات الراكب بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PATCH /api/v1/passengers/[id]
   */
  static async updatePassenger(request: NextRequest, id: string) {
    try {
      const body = await request.json();
      const tenant_id = this.resolveTenantId(request, body.tenant_id);
      const passenger = await PassengerService.updatePassenger(tenant_id, id, body);
      return successResponse(passenger, "تم تحديث بيانات الراكب بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE /api/v1/passengers/[id]
   */
  static async deletePassenger(request: NextRequest, id: string) {
    try {
      const body = await request.json().catch(() => ({}));
      const tenant_id = this.resolveTenantId(
        request,
        body.tenant_id || request.nextUrl.searchParams.get("tenant_id") || undefined
      );
      const passenger = await PassengerService.deletePassenger(tenant_id, id);
      return successResponse(passenger, "تم حذف الراكب بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  private static resolveTenantId(request: NextRequest, fallback?: string): string {
    const tenantId = getTenantIdFromRequest(request) || fallback;
    if (!tenantId) {
      throw new AppError("سياق المؤسسة مطلوب لهذه العملية", 400);
    }
    return tenantId;
  }
}
