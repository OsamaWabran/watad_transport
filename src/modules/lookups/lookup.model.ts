import { prisma } from "@/lib/prisma";
import { LookupType, LookupValue } from "@/app/generated/prisma/client";

export interface CreateLookupTypeDTO {
  tenant_id?: string | null;
  category_code: string;
  category_name: string;
  is_system_defined?: boolean;
}

export interface UpdateLookupTypeDTO {
  category_code?: string;
  category_name?: string;
}

export interface CreateLookupValueDTO {
  category_id: string;
  tenant_id?: string | null;
  value_name: string;
  parent_value_id?: string | null;
}

export interface UpdateLookupValueDTO {
  value_name?: string;
  parent_value_id?: string | null;
}

export type LookupTypeWithValues = LookupType & {
  lookup_values: (LookupValue & {
    children?: LookupValue[];
  })[];
};

export interface LookupScope {
  tenant_id?: string | null;
  includeAllTenants?: boolean;
}

function normalizeTenantId(tenant_id?: string | null) {
  if (!tenant_id) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenant_id)
    ? tenant_id
    : null;
}

function resolveScope(scope?: string | null | LookupScope): LookupScope {
  return typeof scope === "object" && scope !== null ? scope : { tenant_id: scope };
}

function visibleTenantWhere(scope?: string | null | LookupScope) {
  const resolvedScope = resolveScope(scope);
  if (resolvedScope.includeAllTenants) return {};

  const normalizedTenantId = normalizeTenantId(resolvedScope.tenant_id);
  return {
    OR: [
      { tenant_id: null },
      ...(normalizedTenantId ? [{ tenant_id: normalizedTenantId }] : []),
    ],
  };
}

function exactTenantWhere(tenant_id?: string | null) {
  return { tenant_id: normalizeTenantId(tenant_id) };
}

export class LookupModel {
  // Types
  static async findTypeById(
    id: string,
    scope?: string | null | LookupScope,
    includeGlobal = true
  ): Promise<LookupTypeWithValues | null> {
    const tenantId = resolveScope(scope).tenant_id;

    return prisma.lookupType.findFirst({
      where: {
        id,
        ...(includeGlobal ? visibleTenantWhere(scope) : exactTenantWhere(tenantId)),
      },
      include: {
        lookup_values: {
          where: visibleTenantWhere(scope),
          include: {
            children: true,
          },
        },
      },
    }) as Promise<LookupTypeWithValues | null>;
  }

  static async findTypeByCode(
    tenant_id: string | null | undefined,
    category_code: string
  ): Promise<LookupType | null> {
    const code = category_code.trim();

    const normalizedTenantId = normalizeTenantId(tenant_id);

    if (normalizedTenantId) {
      const tenantType = await prisma.lookupType.findFirst({
        where: {
          tenant_id: normalizedTenantId,
          category_code: code,
        },
      });
      if (tenantType) return tenantType;
    }

    return prisma.lookupType.findFirst({
      where: {
        tenant_id: null,
        category_code: code,
      },
    });
  }

  static async findAllTypes(scope?: string | null | LookupScope): Promise<LookupTypeWithValues[]> {
    return prisma.lookupType.findMany({
      where: visibleTenantWhere(scope),
      include: {
        lookup_values: {
          where: visibleTenantWhere(scope),
          include: {
            children: true,
          },
        },
      },
      orderBy: { category_code: "asc" },
    }) as Promise<LookupTypeWithValues[]>;
  }

  static async createType(data: CreateLookupTypeDTO): Promise<LookupType> {
    const tenantId = normalizeTenantId(data.tenant_id);

    return prisma.lookupType.create({
      data: {
        category_code: data.category_code.trim(),
        category_name: data.category_name.trim(),
        is_system_defined: data.is_system_defined ?? false,
        tenant_id: tenantId,
      },
    });
  }

  static async updateType(
    id: string,
    tenant_id: string | null | undefined,
    data: UpdateLookupTypeDTO
  ): Promise<LookupType | null> {
    const existing = await prisma.lookupType.findFirst({
      where: { id, ...exactTenantWhere(tenant_id) },
    });
    if (!existing) return null;

    return prisma.lookupType.update({
      where: { id },
      data: {
        ...(data.category_code && { category_code: data.category_code.trim() }),
        ...(data.category_name && { category_name: data.category_name.trim() }),
      },
    });
  }

  static async deleteType(
    id: string,
    tenant_id: string | null | undefined
  ): Promise<LookupType | null> {
    const existing = await prisma.lookupType.findFirst({
      where: { id, ...exactTenantWhere(tenant_id) },
    });
    if (!existing) return null;

    return prisma.lookupType.delete({
      where: { id },
    });
  }

  // Values
  static async findValueById(
    id: string,
    scope?: string | null | LookupScope,
    includeGlobal = true
  ): Promise<LookupValue | null> {
    const tenantId = resolveScope(scope).tenant_id;

    return prisma.lookupValue.findFirst({
      where: {
        id,
        ...(includeGlobal ? visibleTenantWhere(scope) : exactTenantWhere(tenantId)),
      },
      include: {
        lookup_type: true,
        parent: true,
        children: true,
      },
    });
  }

  static async findValuesByCategoryId(
    category_id: string,
    tenant_id?: string | null | LookupScope,
    parent_value_id?: string | null
  ): Promise<LookupValue[]> {
    return prisma.lookupValue.findMany({
      where: {
        category_id,
        ...visibleTenantWhere(tenant_id),
        ...(parent_value_id !== undefined ? { parent_value_id } : {}),
      },
      include: {
        lookup_type: true,
        parent: {
          include: {
            lookup_type: true,
          },
        },
        children: true,
      },
      orderBy: { value_name: "asc" },
    });
  }

  static async createValue(data: CreateLookupValueDTO): Promise<LookupValue> {
    const tenantId = normalizeTenantId(data.tenant_id);
    const parentValueId = data.parent_value_id || null;

    return prisma.lookupValue.create({
      data: {
        category_id: data.category_id,
        tenant_id: tenantId,
        value_name: data.value_name.trim(),
        parent_value_id: parentValueId,
      },
    });
  }

  static async updateValue(
    id: string,
    tenant_id: string | null | undefined,
    data: UpdateLookupValueDTO
  ): Promise<LookupValue | null> {
    const existing = await prisma.lookupValue.findFirst({
      where: { id, ...exactTenantWhere(tenant_id) },
    });
    if (!existing) return null;

    return prisma.lookupValue.update({
      where: { id },
      data: {
        ...(data.value_name && { value_name: data.value_name.trim() }),
        ...(data.parent_value_id !== undefined ? { parent_value_id: data.parent_value_id || null } : {}),
      },
    });
  }

  static async deleteValue(
    id: string,
    tenant_id: string | null | undefined
  ): Promise<LookupValue | null> {
    const existing = await prisma.lookupValue.findFirst({
      where: { id, ...exactTenantWhere(tenant_id) },
    });
    if (!existing) return null;

    return prisma.lookupValue.delete({
      where: { id },
    });
  }
}
