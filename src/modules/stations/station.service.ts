import { StationModel, CreateStationDTO, UpdateStationDTO } from "./station.model";
import { AppError } from "@/lib/api-response";
import { Station } from "@/app/generated/prisma/client";

export class StationService {
  /**
   * Create a new station
   * T026-b: Role-Based Authorization should be enforced at the API route level
   */
  static async createStation(data: CreateStationDTO): Promise<Station> {
    if (!data.name || data.name.trim() === "") {
      throw new AppError("اسم المحطة مطلوب", 400);
    }
    if (data.location_lat === undefined || data.location_lng === undefined) {
      throw new AppError("إحداثيات المحطة مطلوبة", 400);
    }
    if (!data.type) {
      throw new AppError("نوع المحطة مطلوب", 400);
    }

    return StationModel.create(data);
  }

  /**
   * Fetch Hybrid Stations for a Tenant
   * T026-a: Gets global and tenant-private stations
   */
  static async getStationsForTenant(tenant_id: string): Promise<Station[]> {
    return StationModel.findHybridStations(tenant_id);
  }

  /**
   * Fetch Global Stations only
   */
  static async getGlobalStations(): Promise<Station[]> {
    return StationModel.findHybridStations(null);
  }

  /**
   * Fetch All Stations (Super Admin)
   */
  static async getAllStations(): Promise<Station[]> {
    return StationModel.findAll();
  }

  /**
   * Fetch Station by ID
   */
  static async getStationById(id: string): Promise<Station> {
    const station = await StationModel.findById(id);
    if (!station) {
      throw new AppError("المحطة غير موجودة", 404);
    }
    return station;
  }

  /**
   * Update Station
   */
  static async updateStation(id: string, data: UpdateStationDTO, userRole: string, userTenantId?: string): Promise<Station> {
    const station = await StationModel.findById(id);
    if (!station) {
      throw new AppError("المحطة غير موجودة", 404);
    }

    // T026-b: Role-Based Authorization
    if (station.tenant_id === null && userRole !== "super_admin") {
      throw new AppError("لا تملك صلاحية تعديل محطة عالمية", 403);
    }
    if (station.tenant_id !== null && station.tenant_id !== userTenantId && userRole !== "super_admin") {
      throw new AppError("لا تملك صلاحية تعديل هذه المحطة", 403);
    }

    return StationModel.update(id, data);
  }

  /**
   * Delete Station
   */
  static async deleteStation(id: string, userRole: string, userTenantId?: string): Promise<Station> {
    const station = await StationModel.findById(id);
    if (!station) {
      throw new AppError("المحطة غير موجودة", 404);
    }

    // T026-b: Role-Based Authorization
    if (station.tenant_id === null && userRole !== "super_admin") {
      throw new AppError("لا تملك صلاحية حذف محطة عالمية", 403);
    }
    if (station.tenant_id !== null && station.tenant_id !== userTenantId && userRole !== "super_admin") {
      throw new AppError("لا تملك صلاحية حذف هذه المحطة", 403);
    }

    return StationModel.delete(id);
  }
}
