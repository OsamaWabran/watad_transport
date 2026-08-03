import { AppError } from "@/lib/api-response";
import { Gender } from "@/app/generated/prisma/client";
import { PassengerModel } from "@/src/modules/passengers/passenger.model";
import { CreateFormDTO, FormModel, UpdateFormDTO } from "./form.model";

export class FormService {
  static async getForms(tenant_id: string) {
    if (!tenant_id) throw new AppError("سياق المؤسسة مطلوب", 400);
    return FormModel.findAll(tenant_id);
  }

  static async getFormById(id: string, tenant_id?: string) {
    const form = await FormModel.findById(id, tenant_id);
    if (!form) throw new AppError("النموذج غير موجود", 404);
    return form;
  }

  static async createForm(data: CreateFormDTO) {
    if (!data.tenant_id) throw new AppError("سياق المؤسسة مطلوب", 400);
    if (!data.title || data.title.trim() === "") {
      throw new AppError("عنوان النموذج مطلوب", 400);
    }
    return FormModel.create(data);
  }

  static async updateForm(id: string, tenant_id: string, data: UpdateFormDTO) {
    await this.getFormById(id, tenant_id);
    return FormModel.update(id, tenant_id, data);
  }

  static async deleteForm(id: string, tenant_id: string) {
    await this.getFormById(id, tenant_id);
    return FormModel.delete(id, tenant_id);
  }

  // Submission API with automatic Passenger Upsert (T019)
  static async submitForm(
    form_id: string,
    submissionData: {
      full_name: string;
      contact_number: string;
      gender: Gender;
      default_start_station_id?: string | null;
      default_end_station_id?: string | null;
      answers: Record<string, any>;
    }
  ) {
    // 1. Fetch form without tenant restriction to support public links
    const form = await FormModel.findById(form_id);
    if (!form) throw new AppError("النموذج غير موجود", 404);
    if (!form.is_active) throw new AppError("هذا النموذج غير مفعّل حالياً لتلقي الإجابات", 400);

    const { full_name, contact_number, gender, default_start_station_id, default_end_station_id, answers } = submissionData;

    if (!full_name || full_name.trim() === "") {
      throw new AppError("اسم الطالب / الراكب مطلوب", 400);
    }
    if (!contact_number || contact_number.trim() === "") {
      throw new AppError("رقم التواصل مطلوب", 400);
    }
    if (!gender || !["male", "female"].includes(gender)) {
      throw new AppError("الجنس مطلوب (male أو female)", 400);
    }

    const tenant_id = form.tenant_id;

    // 2. Automatic passenger upsert by tenant_id & contact_number
    let passenger = await PassengerModel.findByContactNumber(tenant_id, contact_number.trim());

    if (passenger) {
      // Update existing passenger & merge extra details
      const existingExtra = (passenger.extra_details as Record<string, any>) || {};
      const updatedExtra = { ...existingExtra, ...answers };

      passenger = await PassengerModel.update(tenant_id, passenger.id, {
        full_name: full_name.trim(),
        gender,
        default_start_station_id: default_start_station_id || passenger.default_start_station_id,
        default_end_station_id: default_end_station_id || passenger.default_end_station_id,
        extra_details: updatedExtra,
      });
    } else {
      // Create new passenger
      passenger = await PassengerModel.create({
        tenant_id,
        full_name: full_name.trim(),
        contact_number: contact_number.trim(),
        gender,
        default_start_station_id: default_start_station_id || null,
        default_end_station_id: default_end_station_id || null,
        extra_details: answers,
      });
    }

    // 3. Create Form Response record
    const response = await FormModel.createResponse({
      form_id,
      tenant_id,
      passenger_id: passenger.id,
      response_data: {
        passenger_info: {
          full_name: passenger.full_name,
          contact_number: passenger.contact_number,
          gender: passenger.gender,
        },
        answers,
      },
    });

    return {
      response_id: response.id,
      passenger_id: passenger.id,
      message: "تم تسجيل إجابتك وحفظ بيانات الراكب بنجاح",
    };
  }

  static async getFormResponses(form_id: string, tenant_id?: string) {
    await this.getFormById(form_id, tenant_id);
    return FormModel.findResponsesByFormId(form_id, tenant_id);
  }
}
