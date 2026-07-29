import { prisma } from "@/lib/prisma";
import { UserRole, User, UserRoles } from "@/app/generated/prisma/client";

export interface CreateUserDTO {
  tenant_id: string;
  user_name: string;
  full_name: string;
  phone_number: string;
  password: string;
  roles?: UserRole[];
}

export interface UserWithRoles extends User {
  user_roles: UserRoles[];
}

export class UserModel {
  static async findById(id: string): Promise<UserWithRoles | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        user_roles: true,
      },
    });
  }

  static async findByUsername(
    tenant_id: string,
    user_name: string
  ): Promise<UserWithRoles | null> {
    return prisma.user.findFirst({
      where: {
        tenant_id,
        user_name: user_name.trim(),
      },
      include: {
        user_roles: true,
      },
    });
  }

  static async findByTenantId(tenant_id: string): Promise<UserWithRoles[]> {
    return prisma.user.findMany({
      where: { tenant_id },
      include: {
        user_roles: true,
      },
      orderBy: { created_at: "desc" },
    });
  }

  static async create(data: CreateUserDTO): Promise<UserWithRoles> {
    const defaultRoles: UserRole[] = data.roles && data.roles.length > 0 ? data.roles : [UserRole.user];

    return prisma.user.create({
      data: {
        tenant_id: data.tenant_id,
        user_name: data.user_name.trim(),
        full_name: data.full_name.trim(),
        phone_number: data.phone_number.trim(),
        password: data.password,
        user_roles: {
          create: defaultRoles.map((role) => ({
            role,
            tenant_id: data.tenant_id,
          })),
        },
      },
      include: {
        user_roles: true,
      },
    });
  }

  static async assignRole(
    user_id: string,
    tenant_id: string,
    role: UserRole
  ): Promise<UserRoles> {
    return prisma.userRoles.upsert({
      where: {
        user_id_role_tenant_id: {
          user_id,
          role,
          tenant_id,
        },
      },
      create: {
        user_id,
        role,
        tenant_id,
      },
      update: {},
    });
  }

  static async removeRole(
    user_id: string,
    tenant_id: string,
    role: UserRole
  ): Promise<void> {
    await prisma.userRoles.deleteMany({
      where: {
        user_id,
        tenant_id,
        role,
      },
    });
  }

  static async update(
    id: string,
    tenant_id: string,
    data: Partial<Pick<CreateUserDTO, "full_name" | "phone_number" | "password">>
  ): Promise<UserWithRoles> {
    return prisma.user.update({
      where: { id, tenant_id },
      data,
      include: { user_roles: true },
    });
  }

  static async delete(id: string, tenant_id: string): Promise<void> {
    // Delete roles first (cascade handled by Prisma but explicit for safety)
    await prisma.userRoles.deleteMany({ where: { user_id: id, tenant_id } });
    await prisma.user.delete({ where: { id, tenant_id } });
  }

  static async findAll(): Promise<UserWithRoles[]> {
    return prisma.user.findMany({
      include: { user_roles: true },
      orderBy: { created_at: "desc" },
    });
  }
}
