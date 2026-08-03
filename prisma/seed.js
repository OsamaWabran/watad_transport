const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:112233@localhost:5432/masarat_saas?schema=public";
const pool = new Pool({ connectionString });

async function seed() {
  console.log("🌱 Starting seed via Node.js pg...");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. System Tenant
    const systemRes = await client.query(
      `INSERT INTO tenants (id, name, code, type, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), 'مسارات - النظام الرئيسي', 'SYS', 'other', true, NOW(), NOW())
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id;`
    );
    const systemTenantId = systemRes.rows[0].id;
    console.log("✅ System Tenant ID:", systemTenantId);

    // 2. Super Admin User
    const superAdminPassword = await bcrypt.hash("admin123", 10);
    const superUserRes = await client.query(
      `SELECT id FROM users WHERE tenant_id = $1 AND user_name = 'superadmin'`,
      [systemTenantId]
    );

    let superUserId;
    if (superUserRes.rows.length === 0) {
      const newUserRes = await client.query(
        `INSERT INTO users (id, tenant_id, user_name, full_name, phone_number, password, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, 'superadmin', 'مدير المنصة الرئيسي', '0500000000', $2, NOW(), NOW())
         RETURNING id;`,
        [systemTenantId, superAdminPassword]
      );
      superUserId = newUserRes.rows[0].id;

      await client.query(
        `INSERT INTO user_roles (user_id, tenant_id, role, assigned_at)
         VALUES ($1, $2, 'super_admin', NOW());`,
        [superUserId, systemTenantId]
      );
      console.log("✅ Super Admin user created:", superUserId);
    } else {
      superUserId = superUserRes.rows[0].id;
      console.log("✅ Super Admin user already exists:", superUserId);
    }

    // 3. KSU Tenant
    const ksuRes = await client.query(
      `INSERT INTO tenants (id, name, code, type, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), 'جامعة الملك سعود', 'KSU', 'university', true, NOW(), NOW())
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id;`
    );
    const ksuTenantId = ksuRes.rows[0].id;
    console.log("✅ KSU Tenant ID:", ksuTenantId);

    // 4. KSU Admin User
    const ksuAdminPassword = await bcrypt.hash("ksu123", 10);
    const ksuUserRes = await client.query(
      `SELECT id FROM users WHERE tenant_id = $1 AND user_name = 'ksu_admin'`,
      [ksuTenantId]
    );

    if (ksuUserRes.rows.length === 0) {
      const newKsuUser = await client.query(
        `INSERT INTO users (id, tenant_id, user_name, full_name, phone_number, password, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, 'ksu_admin', 'د. عبدالحكيم السلمان', '0501122334', $2, NOW(), NOW())
         RETURNING id;`,
        [ksuTenantId, ksuAdminPassword]
      );
      const ksuUserId = newKsuUser.rows[0].id;

      await client.query(
        `INSERT INTO user_roles (user_id, tenant_id, role, assigned_at)
         VALUES ($1, $2, 'admin', NOW());`,
        [ksuUserId, ksuTenantId]
      );
      console.log("✅ KSU Admin user created:", ksuUserId);
    } else {
      console.log("✅ KSU Admin user already exists:", ksuUserRes.rows[0].id);
    }

    await client.query("COMMIT");
    console.log("\n🎉 Database Seeded Successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
