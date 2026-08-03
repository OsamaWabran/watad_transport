import { AppError } from "@/lib/api-response";
import {
  CreateLookupTypeDTO,
  CreateLookupValueDTO,
  LookupScope,
  LookupModel,
  UpdateLookupTypeDTO,
  UpdateLookupValueDTO,
} from "./lookup.model";

export class LookupService {
  // Types
  static async getLookupTypes(scope?: string | null | LookupScope) {
    return LookupModel.findAllTypes(scope);
  }

  static async getLookupTypeById(id: string, scope?: string | null | LookupScope) {
    const type = await LookupModel.findTypeById(id, scope);
    if (!type) {
      throw new AppError("فئة البيانات المرجعية غير موجودة", 404);
    }
    return type;
  }

  static async createLookupType(data: CreateLookupTypeDTO) {
    if (!data.category_code || data.category_code.trim() === "") {
      throw new AppError("رمز فئة البيانات المرجعية مطلوب", 400);
    }
    if (!data.category_name || data.category_name.trim() === "") {
      throw new AppError("اسم فئة البيانات المرجعية مطلوب", 400);
    }

    const existing = await LookupModel.findTypeByCode(data.tenant_id, data.category_code);
    if (existing) {
      throw new AppError("رمز الفئة المرجعية مستخدم بالفعل", 409);
    }

    return LookupModel.createType(data);
  }

  static async updateLookupType(
    id: string,
    tenant_id: string | null | undefined,
    data: UpdateLookupTypeDTO
  ) {
    const existing = await LookupModel.findTypeById(id, tenant_id, false);
    if (!existing) {
      throw new AppError("فئة البيانات المرجعية غير موجودة ضمن المؤسسة الحالية", 404);
    }
    if (existing.is_system_defined) {
      throw new AppError("لا يمكن تعديل فئة مرجعية معرفة بالنظام", 403);
    }

    const updated = await LookupModel.updateType(id, tenant_id, data);
    if (!updated) {
      throw new AppError("فئة البيانات المرجعية غير موجودة ضمن المؤسسة الحالية", 404);
    }
    return updated;
  }

  static async deleteLookupType(id: string, tenant_id: string | null | undefined) {
    const existing = await LookupModel.findTypeById(id, tenant_id, false);
    if (!existing) {
      throw new AppError("فئة البيانات المرجعية غير موجودة ضمن المؤسسة الحالية", 404);
    }
    if (existing.is_system_defined) {
      throw new AppError("لا يمكن حذف فئة مرجعية معرفة بالنظام", 403);
    }

    const deleted = await LookupModel.deleteType(id, tenant_id);
    if (!deleted) {
      throw new AppError("فئة البيانات المرجعية غير موجودة ضمن المؤسسة الحالية", 404);
    }
    return deleted;
  }

  // Values
  static async getLookupValuesByCategory(
    category_id: string,
    tenant_id?: string | null | LookupScope,
    parent_value_id?: string | null
  ) {
    return LookupModel.findValuesByCategoryId(category_id, tenant_id, parent_value_id);
  }

  static async createLookupValue(data: CreateLookupValueDTO) {
    if (!data.category_id || data.category_id.trim() === "") {
      throw new AppError("معرف فئة البيانات المرجعية مطلوب", 400);
    }
    if (!data.value_name || data.value_name.trim() === "") {
      throw new AppError("اسم القيمة المرجعية مطلوب", 400);
    }

    await this.getLookupTypeById(data.category_id, data.tenant_id);

    if (data.parent_value_id) {
      const parent = await LookupModel.findValueById(data.parent_value_id, data.tenant_id);
      if (!parent) {
        throw new AppError("القيمة الأب غير موجودة ضمن المؤسسة الحالية", 400);
      }
    }

    return LookupModel.createValue(data);
  }

  static async updateLookupValue(
    id: string,
    tenant_id: string | null | undefined,
    data: UpdateLookupValueDTO
  ) {
    const val = await LookupModel.findValueById(id, tenant_id, false);
    if (!val) {
      throw new AppError("القيمة المرجعية غير موجودة ضمن المؤسسة الحالية", 404);
    }

    if (data.parent_value_id) {
      const parent = await LookupModel.findValueById(data.parent_value_id, tenant_id);
      if (!parent || parent.id === id) {
        throw new AppError("القيمة الأب غير صالحة لهذه القيمة المرجعية", 400);
      }
    }

    const updated = await LookupModel.updateValue(id, tenant_id, data);
    if (!updated) {
      throw new AppError("القيمة المرجعية غير موجودة ضمن المؤسسة الحالية", 404);
    }
    return updated;
  }

  static async deleteLookupValue(id: string, tenant_id: string | null | undefined) {
    const val = await LookupModel.findValueById(id, tenant_id, false);
    if (!val) {
      throw new AppError("القيمة المرجعية غير موجودة ضمن المؤسسة الحالية", 404);
    }

    const deleted = await LookupModel.deleteValue(id, tenant_id);
    if (!deleted) {
      throw new AppError("القيمة المرجعية غير موجودة ضمن المؤسسة الحالية", 404);
    }
    return deleted;
  }
}
