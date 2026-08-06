import { NextRequest } from "next/server";
import { StationService } from "./station.service";
import { successResponse, handleApiError, AppError } from "@/lib/api-response";

export class StationController {
  /**
   * Helper to extract user context from headers (set by middleware)
   */
  private static getUserContext(request: NextRequest) {
    const tenantId = request.headers.get("x-tenant-id") || undefined;
    const rolesHeader = request.headers.get("x-user-roles");
    const roles: string[] = rolesHeader ? JSON.parse(rolesHeader) : [];
    const isSuperAdmin = roles.includes("super_admin");
    return { tenantId, roles, isSuperAdmin };
  }

  /**
   * GET /api/v1/stations
   */
  static async listStations(request: NextRequest) {
    try {
      const { tenantId, isSuperAdmin } = this.getUserContext(request);
      const searchParams = request.nextUrl.searchParams;
      const queryTenantId = searchParams.get("tenant_id");

      let stations;
      if (isSuperAdmin) {
        stations = await StationService.getAllStations();
      } else if (tenantId) {
        stations = await StationService.getStationsForTenant(tenantId);
      } else if (queryTenantId) {
        // Public form fetch by tenant_id query param
        stations = await StationService.getStationsForTenant(queryTenantId);
      } else {
        stations = await StationService.getGlobalStations();
      }

      return successResponse(stations, "تم جلب المحطات بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST /api/v1/stations
   */
  static async createStation(request: NextRequest) {
    try {
      const { tenantId, isSuperAdmin } = this.getUserContext(request);
      const body = await request.json();

      // Enforce tenant_id based on role
      let finalTenantId: string | null = null;
      
      if (isSuperAdmin) {
        finalTenantId = null; // Super Admin creates Global stations
      } else if (tenantId) {
        finalTenantId = tenantId; // Tenant Admin creates Private stations
      } else {
        throw new AppError("تعذر تحديد سياق المؤسسة", 400);
      }

      const station = await StationService.createStation({
        name: body.name,
        location_lat: body.location_lat,
        location_lng: body.location_lng,
        type: body.type,
        tenant_id: finalTenantId,
      });

      return successResponse(station, "تم إضافة المحطة بنجاح", 201);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET /api/v1/stations/[id]
   */
  static async getStationById(_request: NextRequest, id: string) {
    try {
      const station = await StationService.getStationById(id);
      return successResponse(station, "تم جلب بيانات المحطة بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT /api/v1/stations/[id]
   */
  static async updateStation(request: NextRequest, id: string) {
    try {
      const { tenantId, isSuperAdmin } = this.getUserContext(request);
      const body = await request.json();

      // Convert lat/lng to string to avoid float precision overflow in Prisma Decimal
      if (body.location_lat !== undefined) body.location_lat = String(body.location_lat);
      if (body.location_lng !== undefined) body.location_lng = String(body.location_lng);

      const userRole = isSuperAdmin ? "super_admin" : "admin";
      const station = await StationService.updateStation(id, body, userRole, tenantId);
      return successResponse(station, "تم تحديث بيانات المحطة بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE /api/v1/stations/[id]
   */
  static async deleteStation(request: NextRequest, id: string) {
    try {
      const { tenantId, isSuperAdmin } = this.getUserContext(request);
      const userRole = isSuperAdmin ? "super_admin" : "admin";
      
      const station = await StationService.deleteStation(id, userRole, tenantId);
      return successResponse(station, "تم حذف المحطة بنجاح");
    } catch (error) {
      return handleApiError(error);
    }
  }
}
