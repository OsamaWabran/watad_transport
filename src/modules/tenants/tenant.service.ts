import { TenantModel, CreateTenantDTO, UpdateTenantDTO, TenantFilter } from "./tenant.model";
import { AppError } from "@/lib/api-response";
import { Tenant } from "@/app/generated/prisma/client";

export class TenantService {
  /**
   * Register a new Tenant Organization
   */
  static async registerTenant(data: CreateTenantDTO): Promise<Tenant> {
    if (!data.name || data.name.trim() === "") {
      throw new AppError("اسم المؤسسة مطلوب", 400);
    }
    if (!data.code || data.code.trim() === "") {
      throw new AppError("كود المؤسسة مطلوب", 400);
    }
    if (!data.type) {
      throw new AppError("نوع المؤسسة مطلوب", 400);
    }

    const existing = await TenantModel.findByCode(data.code);
    if (existing) {
      throw new AppError("كود المؤسسة مسجل بالفعل في النظام", 409, "DUPLICATE_TENANT_CODE");
    }

    return TenantModel.create(data);
  }

  /**
   * Activate a Tenant
   */
  static async activateTenant(id: string): Promise<Tenant> {
    const tenant = await TenantModel.findById(id);
    if (!tenant) {
      throw new AppError("المؤسسة غير موجودة", 404);
    }
    return TenantModel.updateStatus(id, true);
  }

  /**
   * Deactivate a Tenant
   */
  static async deactivateTenant(id: string): Promise<Tenant> {
    const tenant = await TenantModel.findById(id);
    if (!tenant) {
      throw new AppError("المؤسسة غير موجودة", 404);
    }
    return TenantModel.updateStatus(id, false);
  }

  /**
   * Toggle Tenant Activation Status
   */
  static async toggleTenantStatus(id: string, is_active: boolean): Promise<Tenant> {
    const tenant = await TenantModel.findById(id);
    if (!tenant) {
      throw new AppError("المؤسسة غير موجودة", 404);
    }
    return TenantModel.updateStatus(id, is_active);
  }

  /**
   * Fetch Tenant by ID
   */
  static async getTenantById(id: string): Promise<Tenant> {
    const tenant = await TenantModel.findById(id);
    if (!tenant) {
      throw new AppError("المؤسسة غير موجودة", 404);
    }
    return tenant;
  }

  /**
   * Fetch All Tenants
   */
  static async getAllTenants(filter?: TenantFilter): Promise<Tenant[]> {
    return TenantModel.findAll(filter);
  }

  /**
   * Update Tenant Details
   */
  static async updateTenant(id: string, data: UpdateTenantDTO): Promise<Tenant> {
    const tenant = await TenantModel.findById(id);
    if (!tenant) {
      throw new AppError("المؤسسة غير موجودة", 404);
    }
    return TenantModel.update(id, data);
  }

  /**
   * Delete Tenant
   */
  static async deleteTenant(id: string): Promise<Tenant> {
    const tenant = await TenantModel.findById(id);
    if (!tenant) {
      throw new AppError("المؤسسة غير موجودة", 404);
    }
    return TenantModel.delete(id);
  }
}
