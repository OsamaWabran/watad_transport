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

  static async submitForm(
    form_id: string,
    submissionData: {
      registration_source?: "form" | "mobile_app" | "manual";
      full_name: string;
      contact_number: string;
      gender: Gender;
      default_start_station_id?: string | null;
      default_end_station_id?: string | null;
      answers: Record<string, any>;
    }
  ) {
    const form = await FormModel.findById(form_id);
    if (!form) throw new AppError("النموذج غير موجود", 404);
    if (!form.is_active) throw new AppError("هذا النموذج غير مفعّل حالياً لتلقي الإجابات", 403);

    const {
      registration_source = "form",
      full_name,
      contact_number,
      gender,
      default_start_station_id,
      default_end_station_id,
      answers,
    } = submissionData;

    const tenant_id = form.tenant_id;

    if (form.purpose !== "passenger_registration") {
      return import("@/lib/prisma").then(({ prisma }) => 
        prisma.formResponse.create({
          data: {
            form_id: form.id,
            tenant_id,
            passenger_id: null,
            response_data: { answers },
          }
        }).then(response => ({
          response_id: response.id,
          message: "تم تسجيل طلبك بنجاح.",
        }))
      );
    }

    if (!full_name || full_name.trim() === "") throw new AppError("الاسم مطلوب", 400);
    if (!contact_number || contact_number.trim() === "") throw new AppError("رقم التواصل مطلوب", 400);
    if (!gender || !["male", "female"].includes(gender)) throw new AppError("الجنس مطلوب", 400);

    const clean_contact = contact_number.trim();

    return import("@/lib/prisma").then(({ prisma }) => 
      prisma.$transaction(async (tx) => {
        // 1. Check existing passenger
        let existingPassenger = await tx.passenger.findFirst({
          where: { tenant_id, contact_number: clean_contact },
        });

        if (existingPassenger) {
          if (existingPassenger.account_status === "Pending" || existingPassenger.account_status === "Active") {
            throw new AppError("رقم الجوال مسجّل مسبقاً، يرجى تسجيل الدخول أو مراجعة الإدارة", 409);
          }
          // If Rejected, we can reuse it (update it) since contact_number is unique per tenant
        }

        // 2. Create or Update Passenger
        let passenger;
        if (existingPassenger) {
          passenger = await tx.passenger.update({
            where: { id: existingPassenger.id },
            data: {
              full_name: full_name.trim(),
              gender,
              account_status: "Pending",
              form_id: form.id,
              registration_source: registration_source as any,
              rejection_reason: null,
              extra_details: answers,
              default_start_station_id: default_start_station_id || existingPassenger.default_start_station_id,
              default_end_station_id: default_end_station_id || existingPassenger.default_end_station_id,
            }
          });
        } else {
          passenger = await tx.passenger.create({
            data: {
              tenant_id,
              full_name: full_name.trim(),
              contact_number: clean_contact,
              gender,
              account_status: "Pending",
              form_id: form.id,
              registration_source: registration_source as any,
              extra_details: answers,
              default_start_station_id: default_start_station_id || null,
              default_end_station_id: default_end_station_id || null,
            }
          });
        }

        // 4. Create Response
        const response = await tx.formResponse.create({
          data: {
            form_id: form.id,
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
          }
        });

        return {
          response_id: response.id,
          passenger_id: passenger.id,
          account_status: passenger.account_status,
          message: "تم تسجيل طلبك بنجاح. سيتم مراجعة بياناتك من قبل الإدارة وإشعارك عند الاعتماد.",
        };
      })
    );
  }

  static async getFormResponses(form_id: string, tenant_id?: string) {
    await this.getFormById(form_id, tenant_id);
    return FormModel.findResponsesByFormId(form_id, tenant_id);
  }
}
