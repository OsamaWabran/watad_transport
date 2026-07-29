/**
 * Masarat SaaS — Database Seed Script
 * Creates:
 *  1. System Tenant (للـ Super Admin)
 *  2. Super Admin User
 *  3. Demo University Tenant (KSU)
 *  4. Demo Admin User for KSU
 */

import { PrismaClient, UserRole, TenantType } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env or .env.local");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...\n");

  // ─── 1. System Tenant ───────────────────────────────────────
  const systemTenant = await prisma.tenant.upsert({
    where: { code: "SYSTEM" },
    update: {},
    create: {
      name: "مسارات - النظام الرئيسي",
      code: "SYSTEM",
      type: TenantType.other,
      is_active: true,
    },
  });
  console.log(`✅ System Tenant: ${systemTenant.id}`);

  // ─── 2. Super Admin User ────────────────────────────────────
  const superAdminPassword = await bcrypt.hash("admin123", 10);
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { tenant_id: systemTenant.id, user_name: "superadmin" },
  });

  let superAdmin;
  if (existingSuperAdmin) {
    superAdmin = existingSuperAdmin;
    console.log(`✅ Super Admin already exists: ${superAdmin.id}`);
  } else {
    superAdmin = await prisma.user.create({
      data: {
        tenant_id: systemTenant.id,
        user_name: "superadmin",
        full_name: "مدير المنصة الرئيسي",
        phone_number: "0500000000",
        password: superAdminPassword,
        user_roles: {
          create: {
            role: UserRole.super_admin,
            tenant_id: systemTenant.id,
          },
        },
      },
    });
    console.log(`✅ Super Admin created: ${superAdmin.id}`);
  }

  // ─── 3. KSU Demo University Tenant ─────────────────────────
  const ksuTenant = await prisma.tenant.upsert({
    where: { code: "KSU" },
    update: {},
    create: {
      name: "جامعة الملك سعود",
      code: "KSU",
      type: TenantType.university,
      is_active: true,
    },
  });
  console.log(`✅ KSU Tenant: ${ksuTenant.id}`);

  // ─── 4. KSU Admin User ──────────────────────────────────────
  const ksuAdminPassword = await bcrypt.hash("ksu123", 10);
  const existingKsuAdmin = await prisma.user.findFirst({
    where: { tenant_id: ksuTenant.id, user_name: "ksu_admin" },
  });

  if (!existingKsuAdmin) {
    const ksuAdmin = await prisma.user.create({
      data: {
        tenant_id: ksuTenant.id,
        user_name: "ksu_admin",
        full_name: "د. عبدالحكيم السلمان",
        phone_number: "0501122334",
        password: ksuAdminPassword,
        user_roles: {
          create: {
            role: UserRole.admin,
            tenant_id: ksuTenant.id,
          },
        },
      },
    });
    console.log(`✅ KSU Admin created: ${ksuAdmin.id}`);
  } else {
    console.log(`✅ KSU Admin already exists: ${existingKsuAdmin.id}`);
  }

  console.log("\n🎉 Seed completed successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔐 Login Credentials:");
  console.log("  Super Admin → username: superadmin  | password: admin123 | tenant_code: SYSTEM");
  console.log("  KSU Admin   → username: ksu_admin   | password: ksu123   | tenant_code: KSU");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
