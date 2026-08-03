import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api-response";
import { Form, FormField, FormFieldType, FormResponse, FormPurpose } from "@/app/generated/prisma/client";
import crypto from "crypto";

export interface CreateFormFieldDTO {
  field_label: string;
  field_type: FormFieldType;
  json_key_mapping: string;
  is_required?: boolean;
  lookup_type_id?: string | null;
  sort_order?: number;
}

export interface UpdateFormFieldDTO extends CreateFormFieldDTO {
  id?: string;
  is_active?: boolean;
}

export interface CreateFormDTO {
  tenant_id: string;
  title: string;
  description?: string;
  purpose?: FormPurpose;
  is_active?: boolean;
  fields?: CreateFormFieldDTO[];
}

export interface UpdateFormDTO {
  title?: string;
  description?: string;
  purpose?: FormPurpose;
  is_active?: boolean;
  fields?: UpdateFormFieldDTO[];
}

export type FormWithFieldsAndResponsesCount = Form & {
  form_fields: FormField[];
  _count?: {
    form_responses: number;
  };
};

export class FormModel {
  static async findById(id: string, tenant_id?: string): Promise<FormWithFieldsAndResponsesCount | null> {
    const where: any = { id };
    if (tenant_id) where.tenant_id = tenant_id;

    return prisma.form.findFirst({
      where,
      include: {
        form_fields: {
          orderBy: { sort_order: "asc" },
          include: {
            lookup_type: {
              include: {
                lookup_values: true,
              },
            },
          },
        },
        _count: {
          select: { form_responses: true },
        },
      },
    }) as Promise<FormWithFieldsAndResponsesCount | null>;
  }

  static async findByHash(hash: string): Promise<FormWithFieldsAndResponsesCount | null> {
    return prisma.form.findUnique({
      where: { public_link_hash: hash },
      include: {
        form_fields: {
          where: { is_active: true },
          orderBy: { sort_order: "asc" },
          include: {
            lookup_type: {
              include: { lookup_values: true },
            },
          },
        },
        _count: { select: { form_responses: true } },
      },
    }) as Promise<FormWithFieldsAndResponsesCount | null>;
  }

  static async findAll(tenant_id: string): Promise<FormWithFieldsAndResponsesCount[]> {
    return prisma.form.findMany({
      where: { tenant_id },
      include: {
        form_fields: {
          orderBy: { sort_order: "asc" },
        },
        _count: {
          select: { form_responses: true },
        },
      },
      orderBy: { created_at: "desc" },
    }) as Promise<FormWithFieldsAndResponsesCount[]>;
  }

  static async create(data: CreateFormDTO): Promise<FormWithFieldsAndResponsesCount> {
    const { tenant_id, title, description, purpose, is_active, fields } = data;
    const public_link_hash = crypto.randomBytes(4).toString("hex");

    return prisma.form.create({
      data: {
        tenant_id,
        title: (title || "").trim(),
        description: description?.trim() || null,
        purpose: purpose || "other",
        public_link_hash,
        is_active: is_active ?? true,
        form_fields: fields
          ? {
              create: fields.map((f, index) => ({
                field_label: (f.field_label || "").trim(),
                field_type: f.field_type,
                json_key_mapping: (f.json_key_mapping || "").trim(),
                is_required: f.is_required ?? false,
                lookup_type_id: f.lookup_type_id || null,
                sort_order: f.sort_order ?? index,
              })),
            }
          : undefined,
      },
      include: {
        form_fields: {
          orderBy: { sort_order: "asc" },
        },
        _count: {
          select: { form_responses: true },
        },
      },
    }) as Promise<FormWithFieldsAndResponsesCount>;
  }

  static async update(
    id: string,
    tenant_id: string,
    data: UpdateFormDTO
  ): Promise<FormWithFieldsAndResponsesCount> {
    const { title, description, purpose, is_active, fields } = data;

    return prisma.$transaction(async (tx) => {
      const existing = await tx.form.findFirst({ where: { id, tenant_id }, include: { _count: { select: { form_responses: true } } } });
      if (!existing) throw new AppError("النموذج غير موجود", 404);

      const hasResponses = existing._count.form_responses > 0;

      if (fields) {
        // Find existing fields
        const existingFields = await tx.formField.findMany({ where: { form_id: id } });
        const existingFieldIds = existingFields.map(f => f.id);
        
        const fieldsToKeep = fields.filter(f => f.id).map(f => f.id as string);
        const fieldsToDelete = existingFieldIds.filter(id => !fieldsToKeep.includes(id));

        // Soft delete fields that are removed
        if (fieldsToDelete.length > 0) {
           await tx.formField.updateMany({
             where: { id: { in: fieldsToDelete } },
             data: { is_active: false }
           });
        }

        // Upsert remaining fields
        for (const [index, field] of fields.entries()) {
          if (field.id) {
            // Update
            const existingField = existingFields.find(f => f.id === field.id);
            if (hasResponses && existingField && (existingField.lookup_type_id !== field.lookup_type_id || existingField.json_key_mapping !== field.json_key_mapping)) {
              throw new AppError("لا يمكن تعديل خصائص الحقول بعد وجود استجابات، قم بتعطيل الحقل وإضافة حقل جديد بدلاً من ذلك", 423);
            }
            await tx.formField.update({
              where: { id: field.id },
              data: {
                field_label: (field.field_label || "").trim(),
                is_required: field.is_required ?? false,
                sort_order: field.sort_order ?? index,
                is_active: field.is_active ?? true,
                ...( !hasResponses && {
                  json_key_mapping: (field.json_key_mapping || "").trim(),
                  lookup_type_id: field.lookup_type_id || null,
                  field_type: field.field_type
                })
              }
            });
          } else {
            // Create
            await tx.formField.create({
              data: {
                form_id: id,
                field_label: (field.field_label || "").trim(),
                field_type: field.field_type,
                json_key_mapping: (field.json_key_mapping || "").trim(),
                is_required: field.is_required ?? false,
                lookup_type_id: field.lookup_type_id || null,
                sort_order: field.sort_order ?? index,
                is_active: true
              }
            });
          }
        }
      }

      return tx.form.update({
        where: { id },
        data: {
          ...(title !== undefined && { title: (title || "").trim() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(purpose !== undefined && { purpose }),
          ...(is_active !== undefined && { is_active }),
        },
        include: {
          form_fields: {
            orderBy: { sort_order: "asc" },
          },
          _count: {
            select: { form_responses: true },
          },
        },
      }) as Promise<FormWithFieldsAndResponsesCount>;
    });
  }

  static async delete(id: string, tenant_id: string): Promise<Form> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.form.findFirst({ where: { id, tenant_id } });
      if (!existing) throw new AppError("النموذج غير موجود", 404);

      return tx.form.delete({
        where: { id },
      });
    });
  }

  // Responses
  static async createResponse(data: {
    form_id: string;
    tenant_id: string;
    passenger_id?: string | null;
    response_data: any;
  }): Promise<FormResponse> {
    return prisma.formResponse.create({
      data: {
        form_id: data.form_id,
        tenant_id: data.tenant_id,
        passenger_id: data.passenger_id || null,
        response_data: data.response_data,
      },
    });
  }

  static async findResponsesByFormId(form_id: string, tenant_id?: string) {
    const where: any = { form_id };
    if (tenant_id) where.tenant_id = tenant_id;

    return prisma.formResponse.findMany({
      where,
      include: {
        passenger: true,
      },
      orderBy: { submitted_at: "desc" },
    });
  }
}
