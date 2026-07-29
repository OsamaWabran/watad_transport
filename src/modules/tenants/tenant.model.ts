import { prisma } from "@/lib/prisma";
import { TenantType, Tenant } from "@/app/generated/prisma/client";

export interface CreateTenantDTO {
  name: string;
  code: string;
  type: TenantType;
  logo?: string;
  is_active?: boolean;
}

export interface UpdateTenantDTO {
  name?: string;
  type?: TenantType;
  logo?: string;
  is_active?: boolean;
}

export interface TenantFilter {
  is_active?: boolean;
  type?: TenantType;
  search?: string;
}

export class TenantModel {
  static async findById(id: string): Promise<Tenant | null> {
    return prisma.tenant.findUnique({
      where: { id },
    });
  }

  static async findByCode(code: string): Promise<Tenant | null> {
    return prisma.tenant.findUnique({
      where: { code: code.trim() },
    });
  }

  static async findAll(filter?: TenantFilter): Promise<Tenant[]> {
    const where: any = {};
    if (filter?.is_active !== undefined) {
      where.is_active = filter.is_active;
    }
    if (filter?.type) {
      where.type = filter.type;
    }
    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { code: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    return prisma.tenant.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  static async create(data: CreateTenantDTO): Promise<Tenant> {
    return prisma.tenant.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim(),
        type: data.type,
        logo: data.logo,
        is_active: data.is_active ?? true,
      },
    });
  }

  static async update(id: string, data: UpdateTenantDTO): Promise<Tenant> {
    return prisma.tenant.update({
      where: { id },
      data,
    });
  }

  static async updateStatus(id: string, is_active: boolean): Promise<Tenant> {
    return prisma.tenant.update({
      where: { id },
      data: { is_active },
    });
  }

  static async delete(id: string): Promise<Tenant> {
    return prisma.tenant.delete({
      where: { id },
    });
  }
}
