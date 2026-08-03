import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api-response";
import { Form, FormField, FormFieldType, FormResponse } from "@/app/generated/prisma/client";

export interface CreateFormFieldDTO {
  field_label: string;
  field_type: FormFieldType;
  is_required?: boolean;
  lookup_type_id?: string | null;
  sort_order?: number;
}

export interface CreateFormDTO {
  tenant_id: string;
  title: string;
  description?: string;
  is_active?: boolean;
  fields?: CreateFormFieldDTO[];
}

export interface UpdateFormDTO {
  title?: string;
  description?: string;
  is_active?: boolean;
  fields?: CreateFormFieldDTO[];
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
    const { tenant_id, title, description, is_active, fields } = data;

    return prisma.form.create({
      data: {
        tenant_id,
        title: title.trim(),
        description: description?.trim() || null,
        is_active: is_active ?? true,
        form_fields: fields
          ? {
              create: fields.map((f, index) => ({
                field_label: f.field_label.trim(),
                field_type: f.field_type,
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
    const { title, description, is_active, fields } = data;

    return prisma.$transaction(async (tx) => {
      const existing = await tx.form.findFirst({ where: { id, tenant_id } });
      if (!existing) throw new AppError("النموذج غير موجود", 404);

      if (fields) {
        await tx.formField.deleteMany({
          where: {
            form_id: id,
            form: { tenant_id },
          },
        });
      }

      return tx.form.update({
        where: { id },
        data: {
          ...(title !== undefined && { title: title.trim() }),
          ...(description !== undefined && { description: description.trim() }),
          ...(is_active !== undefined && { is_active }),
          ...(fields && {
            form_fields: {
              create: fields.map((f, index) => ({
                field_label: f.field_label.trim(),
                field_type: f.field_type,
                is_required: f.is_required ?? false,
                lookup_type_id: f.lookup_type_id || null,
                sort_order: f.sort_order ?? index,
              })),
            },
          }),
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
