import bcrypt from "bcryptjs";
import { UserModel, CreateUserDTO, UserWithRoles } from "./user.model";
import { TenantModel } from "@/src/modules/tenants/tenant.model";
import { AppError } from "@/lib/api-response";
import { UserRole } from "@/app/generated/prisma/client";

export interface UserResponse {
  id: string;
  tenant_id: string;
  user_name: string;
  full_name: string;
  phone_number: string;
  roles: UserRole[];
  created_at: Date;
}

export class AuthService {
  /**
   * Register a new User under a Tenant
   */
  static async registerUser(data: CreateUserDTO): Promise<UserResponse> {
    if (!data.tenant_id || data.tenant_id.trim().length !== 36) {
      throw new AppError("سياق المؤسسة (tenant_id) غير صحيح أو غير موجود", 400);
    }
    if (!data.user_name || data.user_name.trim() === "") {
      throw new AppError("اسم المستخدم مطلوب", 400);
    }
    if (!data.full_name || data.full_name.trim() === "") {
      throw new AppError("الاسم الكامل مطلوب", 400);
    }
    if (!data.password || data.password.length < 6) {
      throw new AppError("كلمة المرور يجب أن لا تقل عن 6 أحرف", 400);
    }

    // 1. Verify Tenant exists and is active
    const tenant = await TenantModel.findById(data.tenant_id);
    if (!tenant) {
      throw new AppError("المؤسسة غير موجودة", 404);
    }
    if (!tenant.is_active) {
      throw new AppError("حساب المؤسسة غير مفعل", 403);
    }

    // 2. Verify Username uniqueness within tenant
    const existingUser = await UserModel.findByUsername(data.tenant_id, data.user_name);
    if (existingUser) {
      throw new AppError("اسم المستخدم مسجل بالفعل في هذه المؤسسة", 409, "DUPLICATE_USERNAME");
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 4. Create User
    const user = await UserModel.create({
      ...data,
      password: hashedPassword,
    });

    return this.formatUserResponse(user);
  }

  /**
   * Authenticate user credentials
   */
  static async loginUser(credentials: {
    tenant_code?: string;
    user_name: string;
    password: string;
  }): Promise<UserResponse> {
    if (!credentials.user_name || !credentials.password) {
      throw new AppError("اسم المستخدم وكلمة المرور مطلوبة", 400);
    }

    let tenantId: string | null = null;
    if (credentials.tenant_code && credentials.tenant_code.trim() !== "") {
      const tenant = await TenantModel.findByCode(credentials.tenant_code);
      if (!tenant) {
        throw new AppError("كود المؤسسة غير صحيح", 404);
      }
      if (!tenant.is_active) {
        throw new AppError("حساب المؤسسة غير مفعل", 403);
      }
      tenantId = tenant.id;
    }

    let user: UserWithRoles | null = null;
    if (tenantId) {
      user = await UserModel.findByUsername(tenantId, credentials.user_name);
    } else {
      // Find across all tenants if no code provided
      const foundUsers = await UserModel.findByUsername("", credentials.user_name); // or custom query
      user = foundUsers;
    }

    if (!user) {
      throw new AppError("بيانات الدخول غير صحيحة", 401);
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new AppError("بيانات الدخول غير صحيحة", 401);
    }

    return this.formatUserResponse(user);
  }

  /**
   * Assign a Role to User
   */
  static async assignRole(
    user_id: string,
    tenant_id: string,
    role: UserRole
  ): Promise<UserResponse> {
    const user = await UserModel.findById(user_id);
    if (!user || user.tenant_id !== tenant_id) {
      throw new AppError("المستخدم غير موجود في هذه المؤسسة", 404);
    }

    await UserModel.assignRole(user_id, tenant_id, role);
    const updatedUser = await UserModel.findById(user_id);
    return this.formatUserResponse(updatedUser!);
  }

  /**
   * Fetch All Users of a Tenant (or all users if no tenant_id)
   */
  static async getUsersByTenant(tenant_id?: string): Promise<UserResponse[]> {
    const users = tenant_id
      ? await UserModel.findByTenantId(tenant_id)
      : await UserModel.findAll();
    return users.map((u) => this.formatUserResponse(u));
  }

  /**
   * Update User fields
   */
  static async updateUser(
    user_id: string,
    tenant_id: string,
    data: { full_name?: string; phone_number?: string; password?: string }
  ): Promise<UserResponse> {
    const user = await UserModel.findById(user_id);
    if (!user || user.tenant_id !== tenant_id) {
      throw new AppError("المستخدم غير موجود في هذه المؤسسة", 404);
    }

    const updateData: { full_name?: string; phone_number?: string; password?: string } = {};
    if (data.full_name?.trim()) updateData.full_name = data.full_name.trim();
    if (data.phone_number?.trim()) updateData.phone_number = data.phone_number.trim();
    if (data.password && data.password.length >= 6) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await UserModel.update(user_id, tenant_id, updateData);
    return this.formatUserResponse(updated);
  }

  /**
   * Delete a User
   */
  static async deleteUser(user_id: string, tenant_id: string): Promise<void> {
    const user = await UserModel.findById(user_id);
    if (!user || user.tenant_id !== tenant_id) {
      throw new AppError("المستخدم غير موجود في هذه المؤسسة", 404);
    }
    await UserModel.delete(user_id, tenant_id);
  }

  /**
   * Helper to format User response (omitting password hash)
   */
  private static formatUserResponse(user: UserWithRoles): UserResponse {
    return {
      id: user.id,
      tenant_id: user.tenant_id,
      user_name: user.user_name,
      full_name: user.full_name,
      phone_number: user.phone_number,
      roles: user.user_roles.map((ur) => ur.role),
      created_at: user.created_at,
    };
  }
}
