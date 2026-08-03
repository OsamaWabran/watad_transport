import { NextRequest } from "next/server";
import { Gender } from "@/app/generated/prisma/client";
import { AppError, handleApiError, successResponse } from "@/lib/api-response";
import { getTenantIdFromAuth } from "@/lib/tenant";
import { PassengerService } from "./passenger.service";

export class PassengerController {
  /**
   * GET /api/v1/passengers
   */
  static async listPassengers(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const tenant_id = await this.resolveTenantId(
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
      const tenant_id = await this.resolveTenantId(request, body.tenant_id);
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
      const tenant_id = await this.resolveTenantId(
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
      const tenant_id = await this.resolveTenantId(request, body.tenant_id);
      const passenger = await PassengerService.updatePassenger(tenant_id, id, body);
      return successResponse(passenger, "تم تحديث بيانات الراكب بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deletePassenger(request: NextRequest, id: string) {
    try {
      const body = await request.json().catch(() => ({}));
      const tenant_id = await this.resolveTenantId(
        request,
        body.tenant_id || request.nextUrl.searchParams.get("tenant_id") || undefined
      );
      const passenger = await PassengerService.deletePassenger(tenant_id, id);
      return successResponse(passenger, "تم حذف الراكب بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET /api/v1/passengers/pending
   */
  static async getPendingPassengers(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const tenant_id = await this.resolveTenantId(
        request,
        searchParams.get("tenant_id") || undefined
      );
      const source = searchParams.get("source") || undefined;
      const passengers = await PassengerService.getPendingPassengers(tenant_id, source);
      return successResponse(passengers, "تم جلب الطلبات المعلقة بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST /api/v1/passengers/[id]/approve
   */
  static async approvePassenger(request: NextRequest, id: string) {
    try {
      let fallback = "c0c7a523-a5c9-4a0b-93f5-7e26d9c66af6";
      try {
        const body = await request.json();
        if (body.tenant_id) fallback = body.tenant_id;
      } catch (e) {}
      const tenant_id = await this.resolveTenantId(request, fallback);
      const passenger = await PassengerService.approvePassenger(tenant_id, id);
      return successResponse(passenger, "تم اعتماد الراكب بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST /api/v1/passengers/[id]/reject
   */
  static async rejectPassenger(request: NextRequest, id: string) {
    try {
      let fallback = "c0c7a523-a5c9-4a0b-93f5-7e26d9c66af6";
      let body: any = {};
      try { body = await request.json(); } catch(e) {}
      const tenant_id = await this.resolveTenantId(request, body.tenant_id || fallback);
      const reason = body.rejection_reason;
      if (!reason) throw new AppError("سبب الرفض مطلوب", 400);
      
      const passenger = await PassengerService.rejectPassenger(tenant_id, id, reason);
      return successResponse(passenger, "تم رفض الراكب بنجاح");
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
