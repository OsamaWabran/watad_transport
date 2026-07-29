import { AppError } from "@/lib/api-response";
import { Gender } from "@/app/generated/prisma/client";
import { TenantModel } from "@/src/modules/tenants/tenant.model";
import {
  CreatePassengerDTO,
  PassengerFilter,
  PassengerModel,
  PassengerWithRelations,
  UpdatePassengerDTO,
} from "./passenger.model";

const genders = ["male", "female"];

export class PassengerService {
  static async createPassenger(
    data: CreatePassengerDTO
  ): Promise<PassengerWithRelations> {
    this.validateTenantId(data.tenant_id);
    this.validateRequired(data.full_name, "اسم الراكب مطلوب");
    this.validateRequired(data.contact_number, "رقم التواصل مطلوب");
    this.validateGender(data.gender);

    const tenant = await TenantModel.findById(data.tenant_id);
    if (!tenant) {
      throw new AppError("المؤسسة غير موجودة", 404);
    }
    if (!tenant.is_active) {
      throw new AppError("لا يمكن إضافة ركاب لمؤسسة غير مفعلة", 400);
    }

    const existing = await PassengerModel.findByContactNumber(
      data.tenant_id,
      data.contact_number
    );
    if (existing) {
      throw new AppError(
        "رقم التواصل مسجل بالفعل لهذا المستأجر",
        409,
        "DUPLICATE_PASSENGER_CONTACT"
      );
    }

    return PassengerModel.create(data);
  }

  static async getPassengers(
    filter: PassengerFilter
  ): Promise<PassengerWithRelations[]> {
    this.validateTenantId(filter.tenant_id);
    if (filter.gender) {
      this.validateGender(filter.gender);
    }
    return PassengerModel.findAll(filter);
  }

  static async getPassengerById(
    tenant_id: string,
    id: string
  ): Promise<PassengerWithRelations> {
    this.validateTenantId(tenant_id);
    const passenger = await PassengerModel.findById(tenant_id, id);
    if (!passenger) {
      throw new AppError("الراكب غير موجود", 404);
    }
    return passenger;
  }

  static async updatePassenger(
    tenant_id: string,
    id: string,
    data: UpdatePassengerDTO
  ): Promise<PassengerWithRelations> {
    const passenger = await this.getPassengerById(tenant_id, id);

    if (data.full_name !== undefined) {
      this.validateRequired(data.full_name, "اسم الراكب مطلوب");
    }
    if (data.contact_number !== undefined) {
      this.validateRequired(data.contact_number, "رقم التواصل مطلوب");
      if (data.contact_number.trim() !== passenger.contact_number) {
        const existing = await PassengerModel.findByContactNumber(
          tenant_id,
          data.contact_number
        );
        if (existing && existing.id !== id) {
          throw new AppError(
            "رقم التواصل مسجل بالفعل لهذا المستأجر",
            409,
            "DUPLICATE_PASSENGER_CONTACT"
          );
        }
      }
    }
    if (data.gender !== undefined) {
      this.validateGender(data.gender);
    }

    return PassengerModel.update(tenant_id, id, data);
  }

  static async deletePassenger(
    tenant_id: string,
    id: string
  ): Promise<PassengerWithRelations> {
    await this.getPassengerById(tenant_id, id);
    return PassengerModel.delete(tenant_id, id);
  }

  private static validateTenantId(tenant_id?: string) {
    if (!tenant_id || tenant_id.trim() === "") {
      throw new AppError("سياق المؤسسة مطلوب لهذه العملية", 400);
    }
  }

  private static validateRequired(value: unknown, message: string) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new AppError(message, 400);
    }
  }

  private static validateGender(gender?: Gender) {
    if (!gender || !genders.includes(gender)) {
      throw new AppError("الجنس يجب أن يكون male أو female", 400);
    }
  }
}
